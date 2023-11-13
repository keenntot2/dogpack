from flask import Flask, render_template, redirect, session, request, flash, jsonify, url_for
from flask_socketio import SocketIO, send, emit
from flask_session import Session
from cs50 import SQL
import os
import base64
#import datetime

from werkzeug.security import check_password_hash, generate_password_hash
from helpers import datetoday, timenow, isPhoto, filename_autoincrement, convert_time_12, login_required, timeago, photo_filename_autoincrement


app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['SECRET_KEY'] = 'dogpack'
Session(app)
socket = SocketIO(app)


# Configure database
db=SQL("sqlite:///data.db")

@app.route('/settings-show')
@login_required
def get_session_id():
    if request.content_type == 'application/json':
        user_id = {}
        db.execute('BEGIN TRANSACTION')
        data = db.execute('SELECT * FROM accounts')
        for row in data:
            user_id[row['username']] = row['id']
        db.execute('COMMIT')
        return jsonify({'session_userId' : session.get('user_id'), 'data' : user_id})
    return redirect('/')

@socket.on('connect')
def connect():
    if session.get('user_id'):
        accounts = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
        print(f"{accounts[0]['firstname']} is online.")
        emit('go', {'user_id' : session.get('user_id')})
    
@socket.on('loadpage')
def load_comments(data):
    print('comments loaded')
    account_names = {}
    comment_time = {}
    username_comment = {}
    post_time = {}

    accounts = db.execute('SELECT * FROM accounts')
    posts = db.execute('SELECT * FROM accounts JOIN posts ON posts.user_id = accounts.id ORDER BY post_date DESC, post_time DESC')
    comments = db.execute('SELECT * FROM comments JOIN accounts ON accounts.id = comments.user_id ORDER BY comment_date, comment_time')

    for row in posts:
        post_time[row['post_id']] = timeago(row['post_date'], row['post_time'])

    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']
        
    for row in comments:
        comment_time[row['comment_id']] = timeago(row['comment_date'], row['comment_time'])
        username_comment[row['comment_id']] = row['username']

    if data['function'] == 'profileLoadComments':
        print('YESIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIR')
        emit('profile-load-comments', {'posts' : posts, 'comments' : comments, 'account_names' : account_names, 'time' : comment_time, 'username_comment' : username_comment, 'data' : data['post_id'], 'post_time' : post_time})
    else:
        emit('loadpage', {'posts' : posts, 'comments' : comments, 'account_names' : account_names, 'time' : comment_time, 'username_comment' : username_comment})

@socket.on('comment')
def comment(commentdata):
    
    db.execute('BEGIN TRANSACTION')
    db.execute('INSERT INTO comments (post_id, user_id, comment, comment_date, comment_time) VALUES (?, ?, ?, ?, ?)', commentdata['post_id'], session.get('user_id'), commentdata['comment'], datetoday(), timenow())
    accounts = db.execute('SELECT * FROM accounts')
    comments = db.execute('SELECT * FROM comments JOIN accounts ON accounts.id = comments.user_id ORDER BY comment_date DESC, comment_time DESC')
    db.execute('COMMIT')
    
    account_names = {}
    comment_time = {}
    username_comment = {}

    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']
    for row in comments:
        comment_time[row['comment_id']] = timeago(row['comment_date'], row['comment_time'])
        username_comment[row['comment_id']] = row['username']

    print(username_comment)

    emit('comment', {'comments' : comments[0], 'account_names' : account_names, 'time' : comment_time, 'username_comment' : username_comment}, broadcast=True)
    
# update liked/unliked posts
@socket.on('like_unlike_posts')
def like_unlike_posts(data):

    # update likes on post 
    if data['what'] == 'like':
        db.execute('INSERT INTO user_post_likes (user_id, post_id) VALUES(?, ?)', session.get('user_id'), data['post_id'])
        db.execute('UPDATE posts SET post_likes = post_likes + 1 WHERE post_id = ?', data['post_id'])
    
    # unlike post
    else:
        db.execute('DELETE FROM user_post_likes WHERE user_id = ? and post_id = ?', session.get('user_id'), data['post_id'])
        db.execute('UPDATE posts SET post_likes = post_likes - 1 WHERE post_id = ?', data['post_id'])
    
    posts = db.execute('SELECT * FROM posts WHERE post_id = ?', data['post_id'])
    emit('append_likes_post', {'posts' : posts}, broadcast=True)

# show more button
@socket.on('show-more')
def show_more():
    
    #comments = db.execute('SELECT * FROM comments JOIN accounts ON accounts.id = comments.user_id ORDER BY comment_date DESC, comment_time DESC')
    # db.execute('BEGIN TRANSACTION')
    comments = db.execute('SELECT * FROM comments WHERE user_id = ?', session.get('user_id'))    
    # db.execute('COMMIT')
    #key
    data_userID = {}

    #user ids
    user = []
    #values
    values = []

    for row in comments:
        #data_userID[row['user_id']] = row['comment_id']
        values.append(row['comment_id'])
    data_userID[session.get('user_id')] = values

    emit('deleteComment', {'data' : data_userID})

# DELETE COMMENT FROM DATABASE
@socket.on('delete_subComment')
def delete_comment(data):
    db.execute('DELETE FROM comments WHERE comment_id = ?', data['id'])
    emit('delete_subComment', {'id' : data['id']}, broadcast=True)

# DELETE POST FROM DATABASE
@socket.on('delete_post')
def delete_post(data):
    print(data['post_id'])
    db.execute('DELETE FROM posts WHERE post_id = ? AND user_id = ?', data['post_id'], session.get('user_id'))
    emit('delete_post', {'post_id' : data['post_id']}, broadcast=True)

# UPDATE LIKES (COMMENTS) 
@socket.on('update-comment')
def update_comment(data):
    if data['function'] == 'like':
        db.execute('BEGIN TRANSACTION')
        db.execute('INSERT INTO user_comment_likes (user_id, comment_id) VALUES (?, ?)', session.get('user_id'), data['comment_id'])
        db.execute('UPDATE comments SET comment_likes = comment_likes + 1 WHERE comment_id = ?', data['comment_id'])
        db.execute('COMMIT')
    else:
        db.execute('BEGIN TRANSACTION')
        db.execute('DELETE FROM user_comment_likes WHERE user_id = ? AND comment_id = ?', session.get('user_id'), data['comment_id'])
        db.execute('UPDATE comments SET comment_likes = comment_likes - 1 WHERE comment_id = ?', data['comment_id'])
        db.execute('COMMIT')
    total_commentLikes = db.execute('SELECT * FROM comments WHERE comment_id = ?', data['comment_id'])
    emit('update-comment', {'result' : data['function'], 'comment_likes' : total_commentLikes, 'comment_id' : data['comment_id']}, broadcast=True)

# GET likes data 
@app.route('/like-comments-onload')
@login_required
def like_comments_onload():
    if request.content_type == 'application/json':
        data = db.execute('SELECT * FROM user_comment_likes WHERE user_id = ?', session.get('user_id'))
        return jsonify({'data' : data})
    return redirect('/')

# GET COMMENT TOTAL LIKES
@app.route('/get-total-comment-likes')
@login_required
def get_total_comment_likes():
    if request.content_type == 'application/json':
        db.execute('BEGIN TRANSACTION')
        data = db.execute('SELECT * FROM comments')
        db.execute('COMMIT')
        return jsonify({'data' : data})
    return redirect('/')

# GET NUMBER OF COMMENTS AND LIKES ajax
@app.route('/get-post-comments-likes')
@login_required
def get_post_comments_likes():
    if request.content_type == 'application/json':
        data = request.args.get('img_id')
        post_likes = db.execute('SELECT * FROM posts WHERE post_id = ?', data)
        comments = db.execute('SELECT COUNT(comment) AS comments FROM comments WHERE post_id = ?', data)
        # result = db.execute('SELECT user_id, post_id, COUNT(comment) AS comments, post_likes from(select * from posts join comments on comments.post_id = posts.post_id) WHERE post_id = ? GROUP BY post_id', data)
        return jsonify({'post_likes': post_likes , 'comments' : comments})
    return redirect('/')

@app.route('/gallery')
@login_required
def gallery():
    # CODE GOES HERE
    account_names = {}
    username_name = {}
    # dp = {}
    accounts = db.execute('SELECT * FROM accounts')
    # display_pic = db.execute('SELECT * FROM profile_picture JOIN accounts ON accounts.id = profile_picture.user_id')
    profile_pic = db.execute('SELECT * FROM profile_picture WHERE user_id = ?', session.get('user_id'))
    account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
    post_images = db.execute('SELECT * FROM accounts JOIN posts ON accounts.id = posts.user_id JOIN profile_picture ON profile_picture.user_id = accounts.id ORDER BY post_date DESC, post_time DESC')

    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']
        username_name[row['username']] = row['firstname'] + ' ' + row['surname']

    #for row in display_pic:
    # dp[row['username']] = row['profile_photo']

    return render_template('gallery.html', name=account_names, profile_pic = profile_pic[0]['profile_photo'], account_username=account_username[0]['username'], user_id=session.get('user_id'), post_images=post_images)

   
    
    

# Index
@app.route("/", methods=["GET", "POST"])
@login_required
def index():  
    account_names = {}
    username_post = {}

    accounts = db.execute('SELECT * FROM accounts')
    posts = db.execute('SELECT * FROM accounts JOIN posts ON posts.user_id = accounts.id ORDER BY post_date DESC, post_time DESC')
    comments = db.execute('SELECT * FROM comments JOIN accounts ON accounts.id = comments.user_id ORDER BY comment_date, comment_time')
    profile_pic = db.execute('SELECT * FROM profile_picture WHERE user_id = ?', session.get('user_id'))
    account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))

    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']
    
    for row in posts:
        username_post[(row['post_id'])] = row['username']
    
    return render_template("index.html", posts=posts, time12=convert_time_12, comments=comments, timeago=timeago, name=account_names, profile_pic = profile_pic[0]['profile_photo'], account_username=account_username[0]['username'], username_post=username_post)


# SEARCH 
@app.route('/search')
@login_required
def search():
    if request.content_type == 'application/json':
        name = request.args.get('name')
        print(name)
        name = name+'%'
        data = db.execute('SELECT * FROM accounts WHERE firstname like ? OR surname like ? OR username like ?',
                           name, name, name)
        return jsonify({'result' : data})
    return redirect('/')

# Profile/settings/change-password
@app.route('/settings/change-password')
@login_required
def change_password():

    account_names = {}
    accounts = db.execute('SELECT * FROM accounts')
    profile_pic = db.execute('SELECT * FROM profile_picture WHERE user_id = ?', session.get('user_id'))
    account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))

    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']

    return render_template('changepassword.html', name=account_names, profile_pic = profile_pic[0]['profile_photo'], account_username=account_username[0]['username'])

@app.route('/settings/change-password/ajax', methods=["GET", "POST"])
def change_password_ajax():
    if request.content_type == 'application/json':
        if request.method == 'POST':
            data = request.get_json()
            if (data['new_pw'] == data['verify_pw'] and len(data['new_pw']) >= 6):
                new_pw = generate_password_hash(data['new_pw'])
                db.execute('UPDATE accounts SET password = ? WHERE id = ?', new_pw, session.get('user_id'))
                return jsonify({'result': url_for('index')})
        print(request.content_type)
        old_pw = request.args.get('old_pw')
        accounts = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
        return jsonify({'result' : check_password_hash(accounts[0]['password'], old_pw)})
    return redirect('/settings/change-password')

@app.route('/profile/<username>')
@login_required
def profile(username):
    isUser = db.execute('SELECT * FROM accounts WHERE username = ?', username)
    if isUser:
        # CODE GOES HERE
        account_names = {}
        username_name = {}
        dp = {}
        accounts = db.execute('SELECT * FROM accounts')
        display_pic = db.execute('SELECT * FROM profile_picture JOIN accounts ON accounts.id = profile_picture.user_id')
        profile_pic = db.execute('SELECT * FROM profile_picture WHERE user_id = ?', session.get('user_id'))
        account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
        post_images = db.execute('SELECT * FROM accounts JOIN posts ON accounts.id = posts.user_id ORDER BY post_date DESC, post_time DESC')

        for row in accounts:
            account_names[row['id']] = row['firstname'] + ' ' + row['surname']
            username_name[row['username']] = row['firstname'] + ' ' + row['surname']

        for row in display_pic:
            dp[row['username']] = row['profile_photo']

        return render_template('profile.html', name=account_names, profile_pic = profile_pic[0]['profile_photo'], account_username=account_username[0]['username'], user_id=session.get('user_id'), username=username, username_name=username_name, dp=dp, post_images=post_images)
    else:
        return redirect('/')
    
@app.route('/more-posts')
@login_required
def more_posts():
    posts = []
    data = db.execute('SELECT * FROM posts WHERE user_id = ?', session.get('user_id'))
    for row in data:
        posts.append(row['post_id'])
    return jsonify({'data' : posts})


@app.route('/profile/getusername')
@login_required
def getusername():
    account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
    return jsonify({'username' : account_username})

# Updates Profile Picture
@app.route('/profile/updatepp', methods=['POST'])
@login_required
def updatepp():
    data = request.json
    filename = photo_filename_autoincrement(data['filename'], session.get('user_id'))
    files = os.listdir(f"static/images/profile_pic/{session.get('user_id')}")
    if files is None or files == []:
        with open (f"static/images/profile_pic/{session.get('user_id')}/{filename}", 'wb') as f:
            f.write(base64.b64decode(data['image']))
    for row in files:
        os.remove(f"static/images/profile_pic/{session.get('user_id')}/{row}")
    with open (f"static/images/profile_pic/{session.get('user_id')}/{filename}", 'wb') as f:
        f.write(base64.b64decode(data['image']))
    path = f"/static/images/profile_pic/{session.get('user_id')}/{filename}"
    db.execute('UPDATE profile_picture SET profile_photo = ? WHERE user_id = ?', path, session.get('user_id') )
    return jsonify({'path' : path})


# Login
@app.route("/login", methods=["GET", "POST"])
def login():
    session.clear()
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        check_un = db.execute("SELECT * FROM accounts WHERE username = ?", username)
        error = {}
        if not check_un:
            error["un_notfound"] = "The username you entered isn't connected to an account."
        elif not check_password_hash(check_un[0]["password"], password):
            error["incorrect_pw"] = "Incorrect Password."
        if error:
            return render_template("login.html", error=error, username=username)
        else:
            session["user_id"] = check_un[0]["id"]
            return redirect("/")
        
    return render_template("login.html")

# Register
@app.route("/register", methods=["GET", "POST"])
def register():
    session.clear()
    if request.method == "POST":
        firstname = request.form.get("first_name")
        surname = request.form.get("surname")
        username = request.form.get("username")
        password = request.form.get("password")
        confirmationpassword = request.form.get("confirmation_password")
        error = {}
        if not firstname or not surname or not username or not password or not confirmationpassword:
            if not firstname:
                error["fn"] = "Enter first name"
            if not surname:
                error["sn"] = "Enter surname"
            if not username:
                error["un"] = "Enter a username"
            if not password:
                error["pw"] = "Enter a password"
            if not confirmationpassword:
                error["cp"] = "Enter confirmation password"
            return render_template("register.html", error=error, firstname=firstname, surname=surname, username=username, password=password, confirmationpassword=confirmationpassword)
        else:
            if len(username) < 6:
                    error["min_username"] = "Username must be at least 6 charaters"
            if len(password) < 6:
                    error["min_pass"] = "Password must be at least 6 characters"
            if password != confirmationpassword:
                error["confirm_pass"] = "Password and confirmation password did not match"
            # Check if username in database
            checkusername = db.execute("SELECT username FROM accounts WHERE username = ?", username)
            if checkusername:
                error["existing_un"] = "Username already taken"
            # Check for errors to render flash messages
            if error:
                return render_template("register.html", error=error, firstname=firstname, surname=surname, username=username, password=password, confirmationpassword=confirmationpassword)
            # Generate password hash
            password_hashed = generate_password_hash(password)
            # If there are no errors, store information to database
            db.execute("INSERT INTO accounts (firstname, surname, username, password, date, time) VALUES (?,?,?,?,?,?)"
                       , firstname, surname, username, password_hashed, datetoday(), timenow())
            # Create Session and directory for photos
            id = db.execute("SELECT * FROM accounts WHERE username = ?", username)
            os.mkdir(f"static/images/{id[0]['id']}")
            os.mkdir(f"static/images/profile_pic/{id[0]['id']}")
            session["user_id"] = id[0]["id"]
            return redirect("/")
    return render_template("register.html")


# Upload Photo
@app.route("/add-photo", methods=['GET'])
@login_required
def add_photo():
    account_names = {}
    accounts = db.execute('SELECT * FROM accounts')
    profile_pic = db.execute('SELECT * FROM profile_picture WHERE user_id = ?', session.get('user_id'))
    account_username = db.execute('SELECT * FROM accounts WHERE id = ?', session.get('user_id'))
    for row in accounts:
        account_names[row['id']] = row['firstname'] + ' ' + row['surname']
    
    return render_template("addphoto.html", name=account_names, user_id=session.get('user_id'), profile_pic=profile_pic[0]['profile_photo'], account_username=account_username[0]['username'])

# Add photo via Ajax
@app.route('/add-photo-ajax', methods=['POST', 'GET'])
@login_required
def add_photo_ajax():

    if request.content_type:
        image_data = request.get_json()
        caption = image_data['caption']
        photo = image_data['image_data']
        filename = image_data['filename']
        print(len(photo[0]))
        if isPhoto(filename):
            new_filename = filename_autoincrement(photo, filename, session.get('user_id'))
            # Update addphoto form to database
            db.execute('INSERT INTO posts (user_id, photo, caption, post_date, post_time) VALUES (?, ?, ?, ?, ?)', session.get('user_id'), new_filename, caption, datetoday(), timenow())
            return jsonify({'result' : 'success'})
    return redirect('/add-photo')

      
    
# Update post and comment time via ajax
@app.route('/update-post-comment-time')
@login_required
def update_comment_time():
        post_q = """
            SELECT * FROM accounts
            JOIN posts ON posts.user_id = accounts.id
            ORDER BY post_date DESC, post_time DESC
        """
        comment_q = """
            SELECT *
            FROM comments
            JOIN accounts ON accounts.id = comments.user_id
            JOIN posts ON posts.post_id = comments.post_id
            ORDER BY post_id DESC, comment_date, comment_time
        """

        posts = db.execute(post_q)
        comments = db.execute(comment_q)

        comment_time = {}     
        post_time = {}        

        for row in comments:
            comment_time[row["comment_id"]] = (timeago(row['comment_date'], row['comment_time']))
            
        for row in posts:
            post_time[row['post_id']] = timeago(row['post_date'], row['post_time'])

        return jsonify({'time' : comment_time, 'post_time' : post_time})

    

# UPDATE POST LIKES 
@app.route('/update-post-likes', methods=['GET'])
@login_required
def update_post_likes():
    rows = db.execute('SELECT * FROM user_post_likes')
    return jsonify({'data' : rows, 'user_id' : session.get('user_id')}) 


# Logout
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == '__main__':
    socket.run(app, debug=True)