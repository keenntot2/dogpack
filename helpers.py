import datetime
import os
from functools import wraps
from flask import redirect, render_template, session, jsonify
import base64


def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/0.12/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function

def timenow():
    t = datetime.datetime.now().strftime("%H:%M:%S")
    return t


def datetoday():
    d = datetime.date.today()
    return d

def convert_time_12(time):
    t = datetime.datetime.strptime(time, '%H:%M:%S')
    return t.strftime('%I:%M %p')

def timeago(date, time):
    now = datetime.datetime.now()
    ago = datetime.datetime.strptime(f'{date} {time}', '%Y-%m-%d %H:%M:%S')

    dif = now - ago

    s = dif.total_seconds()
    m = float(s/60)
    hr = float(s/3600)
    d = float(s/86400)
    w = float(s/604800)
    mos = float(s/2.628e+6)
    yr = float(s/3.154e+7)

    if s < 60:
        return(f'{int(s)}s')
    elif m < 60:
        return(f'{int(m)}m')
    elif hr < 24:
        return(f'{int(hr)}h')
    elif d <= 7:
        return(f'{int(d)}d')
    elif w >= 1 and mos < 1:
        return(f'{int(w)}w')
    elif mos < 2:
        return(f'{int(mos)}mo')
    elif mos <= 2:
        return(f'{int(mos)}mos')
    elif yr >= 1:
        return(f'{int(yr)}yr')
    
def isPhoto(filename):

    file_ext = os.path.splitext(filename)[1]

    ext = ['.jpg', '.jpeg', '.png', '.gif', '.svg']
   
    if file_ext in ext:
        return True
    return False


def filename_autoincrement(photo,filename, user_id):
    path = f'static/images/{user_id}'
    # checks if filename exists
    if os.path.exists(f'{path}/{filename}'):
        file = os.path.splitext(filename)

        i = 1
        new_filename = file[0] + '_' + str(i) + file[1]
        # increments filename
        while new_filename in os.listdir(path):
            i += 1
            new_filename = file[0] + '_' + str(i) + file[1]
        #path_newfile = os.path.join(path, new_filename)
        #photo.save(path_newfile)
        with open (f'./static/images/{user_id}/{new_filename}', 'wb') as img:
            img.write(base64.b64decode(photo))
        return new_filename
    with open (f'./static/images/{user_id}/{filename}', 'wb') as img:
        img.write(base64.b64decode(photo))
    #photo.save(f'{path}/{filename}')
    return filename

def photo_filename_autoincrement(filename, user_id):
    path = f'static/images/profile_pic/{user_id}'
    # checks if filename exists
    if os.path.exists(f'{path}/{filename}'):
        file = os.path.splitext(filename)

        i = 1
        new_filename = file[0] + '_' + str(i) + file[1]
        # increments filename
        while new_filename in os.listdir(path):
            i += 1
            new_filename = file[0] + '_' + str(i) + file[1]
        return new_filename
    return filename


