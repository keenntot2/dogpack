// document.addEventListener('DOMContentLoaded', function() {
$(document).ready(function() {

    $('*').css('cursor' ,'wait')
    // connects socket
    var socket = io();

    // window url location
    let location = window.location.href.split('/')

    
    socket.on('go', function(data) {
        user_id = data.user_id
    })

    $(window).on('resize', function() {
        $('.wrapper-content').css({'margin-left' : `${$('.navbar').width()}px`, 'width' : `${$('body').width() - $('.navbar').width()}` + 'px'})
    })
    
    // DEVICE WIDTH CSS CONFIGURATION
    if ($(window).outerWidth() <= 767) {

        $('.wrapper-index, .profile-post, .slidedown, .pp-edit').css('margin-top', $('.navbar').outerHeight())
        $('.container-profile, .wrapper-addphoto').css('padding-top', $('.navbar').outerHeight())
        $('.searchpopup').css('top', `${$('.navbar').outerHeight()}px`)     

        $(window).on('resize', function() {
            $('.wrapper-index, .profile-post, .slidedown').css('margin-top', $('.navbar').outerHeight())
            $('.container-profile, .wrapper-addphoto').css('padding-top', $('.navbar').outerHeight())
            $('.searchpopup').css('top', `${$('.navbar').outerHeight()}px`)     
        })

    }

    //------------------------------------------------- NAVBAR SCRIPT -------------------------------------------------//

    $('.wrapper-content').css({'margin-left' : `${$('.navbar').outerWidth()}px`, 'width' : `${$('body').outerWidth() - $('.navbar').outerWidth()}` + 'px'})
    //$('.wrapper-ppedit').css('margin-left', `${$('.navbar').width()}px`)

    // blurs when window is not finish loading
    //document.querySelector('*').style.opacity = '0';
    //window.addEventListener('load', function() {
    //    document.querySelector('*').style.opacity = '1';
    //})

    let spans = ['.home span', '.search span', '.gallery span', '.add-photo span']
    let links = ['.home a', '.search a', '.gallery a', '.add-photo a']

    $.each(spans, function(i) {        
        $(document).on('mouseenter', links[i], function() {
            $(spans[i]).css({'color' : 'white', 'transform' : 'scale(1.1)', 'transition' : 'transform 0.3s'})
        }) 
    })


    $(document).on('mouseenter', '.logout a', function() {
        $('.logout span').css('color', 'red')
    })
    $(document).on('mouseleave', '.logout a, .home a, .search a, .gallery a, .add-photo a', function() {
        $('.logout span, .home span, .search span, .gallery span, .add-photo span').css({'color' : '', 'transform' : 'scale(1)'})
    })

    //------------------------------------------------- INDEX SCRIPT-------------------------------------------------//

    //------------------------------------------------- COMMENT SCRIPT -------------------------------------------------//

    //load comments
    socket.emit('loadpage', {'function' : 'load'})

    //load comments
    socket.on('loadpage', function(data) {                
        for (let post = 0; post < data.posts.length; post++) {
            for (let comment = 0; comment < data.comments.length; comment++ ) {
                if (data.posts[post]['post_id'] == data.comments[comment]['post_id']) {

                    let content = `
                    <div class="sub_comments" id="subCommentsID${data.comments[comment]['comment_id']}">
                        <div class="commentDiv" id="commentDivID${data.comments[comment]['comment_id']}">
                            <div class="delete_comment">
                                <div class="delete_button">
                                    <p id="deleteButtonID${data.comments[comment]['comment_id']}">Delete comment</p>
                                </div>                                                                
                                <img src="/static/icons/more_horizontal.svg" alt="" id="moreComment${data.comments[comment]['comment_id']}">
                            </div>
                            <a href="/profile/${data.username_comment[data.comments[comment]['comment_id']]}">
                                <p class="comment_name">${data.account_names[data.comments[comment]['user_id']]}</p>
                            </a>
                            <p class="comment" role="text">${data.comments[comment]['comment']}</p>
                        </div>
                        <div class="likeDiv">
                            <p class="no_likes_button" id="no_likes_buttonID${data.comments[comment]['comment_id']}">0</p>
                            <p class="like_button" id="like_buttonID${data.comments[comment]['comment_id']}">like</p>
                            <p class="comment_time" id="commentTime${data.comments[comment]['comment_id']}">${data.time[data.comments[comment]['comment_id']]}</p>
                        </div>
                    </div>
                `
                $('#commentsID' + data.posts[post]['post_id']).append(content)
                //document.querySelector('#commentsID' + data.posts[post]['post_id']).innerHTML += content;

                }


            }
        }
        likeCommentOnload()
        totalCommentLikes()
        window.scrollTo(0, 0);


    })



    socket.emit('show-more')

    // updates comment time every 5 seconds
    fivesecondinterval()

    function fivesecondinterval() {
        setInterval(function(){
            aj = $.ajax({
                url: '/update-post-comment-time',
                type: 'GET',
                success: function(data) {
                    $('.comment_time').each(function(i) {
                        commentTime_id = $(this).attr('id').replaceAll('commentTime', '')
                        $('#commentTime'+commentTime_id).text(data.time[commentTime_id])                                         
                    })   
    
                    $('.post_time').each(function(i) {
                        postTime_id = $(this).attr('id').replaceAll('postTime', '')
                        $('#postTime' + postTime_id).text(data.post_time[postTime_id])
                    })
                }
            })
        }, 5000)  
    }


    // appends comment in html

    socket.on('comment', function(data) {
        let content = `
            <div class="sub_comments" style="display: none;" id="subCommentsID${data.comments['comment_id']}">
                <div class="commentDiv" id="commentDivID${data.comments['comment_id']}">
                    <div class="delete_comment">
                        <div class="delete_button">
                            <p id="deleteButtonID${data.comments['comment_id']}">Delete comment</p>
                        </div>
                        <img src="/static/icons/more_horizontal.svg" alt="" id=moreComment${data.comments['comment_id']}>
                    </div>
                    <a href="/profile/${data.username_comment[data.comments['comment_id']]}">
                        <p class="comment_name">${data.account_names[data.comments['user_id']]}</p>
                    </a>                    
                    <p class="comment" role="text">${data.comments['comment']}</p>
                </div>
                <div class="likeDiv">
                    <p class="no_likes_button" id="no_likes_buttonID${data.comments['comment_id']}">0</p>
                    <p class="like_button" id="like_buttonID${data.comments['comment_id']}">like</p>
                    <p class="comment_time" id="commentTime${data.comments['comment_id']}">${data.time[data.comments['comment_id']]}</p>
                </div>
            </div>
        `

        $('#commentsID' + data.comments['post_id']).append(content)
        //document.querySelector('#commentsID' + data.comments['post_id']).innerHTML += content;
        $('#subCommentsID' + data.comments['comment_id']).fadeIn(800)
        $('.profile-post .comments').scrollTop(999)
        likeCommentOnload()
    })

    //... sends comment information to server ...//

    // sends comment info to server VIA mouse down
    $(document).on('mousedown', '.comment_section button', async function() {
        let post_id = $(this).attr('id').replaceAll('buttonID','')
        let comment = $('#commentPostID'+post_id).val()

        if (comment.trim().length != 0) {
            $(this).css('box-shadow', 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px inset');            
            $('#spanID'+post_id).text(null)
            $('#commentPostID'+post_id).val(null)
            $('#buttonID'+post_id).css({'cursor' : 'not-allowed', 'color' : '#8d8741'})
            await socket.emit('comment', {'post_id' : post_id, 'comment' : comment})
            $('#spanID' + post_id).blur()
            //$('#commentsectionID' + post_id).fadeOut(300).fadeIn(300)            
            setTimeout(function(){
                socket.emit('show-more') 
            }, 500)    



        }
        if (comment.trim().length == 0) {
            $(this).css('box-shadow', 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px');
        };

    });
    $(document).on('mouseup', 'body', function() {
        $('.comment_section button').css('box-shadow', 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px');
    });

    // css response on input (comment)
    $(document).on('input','.comment_section span' , function() {
        let post_id = $(this).attr('id').replaceAll('spanID', '')
        $('#commentPostID'+post_id).val($(this).text())
        if ($(this).text().trim().length > 0) {
            $('#buttonID'+post_id).css({'font-weight' : '600', 'cursor' : 'pointer'})
        }
        if ($(this).text().trim().length == 0) {
            $('#buttonID'+post_id).css({'cursor' : 'not-allowed', 'color' : '', 'font-weight' : '400'})     
        }
    })

    // sends comment info to server VIA 'ENTER' key
    $(document).on('keypress', '.comment_section span', async function(event) {

        if (event.key == 'Enter') {

            event.preventDefault()
            $(this).text('')


            let post_id = $(this).attr('id').replaceAll('spanID', '')
            let comment = $('#commentPostID'+post_id).val()

            if (comment.trim().length > 0) {                                
                $('#spanID'+post_id).text(null)
                $('#commentPostID'+post_id).val(null)
                $('#buttonID'+post_id).css({'cursor' : 'not-allowed', 'color' : '#8d8741'})
                await socket.emit('comment', {'post_id' : post_id, 'comment' : comment})
                $(this).blur()
                setTimeout(function(){
                    $('#spanID'+post_id).focus()
                }, 1000)
                //$('#commentsectionID' + post_id).fadeOut(300).fadeIn(300)
                setTimeout(function(){
                    socket.emit('show-more') 
                }, 500)                                                                   
            }
        }
    })



    function deleteComment() {
        // --- shows 'more' button on comment div --- //

        $(document).on('mouseleave', '.commentDiv', function() {
            let comment_id = $(this).attr('id').replaceAll('commentDivID', '')
            if ($('#deleteButtonID' + comment_id).css('display') == 'block') {
                $('#moreComment' + comment_id).css({'display' : 'block'})
            }
            else {
                $('#moreComment' + comment_id).css({'display' : 'none'})
            }

        })

        socket.on('deleteComment', function(data) {
            $(document).on('mouseover', '.commentDiv', function() {
                let comment_id = $(this).attr('id').replaceAll('commentDivID', '')
                //showmorebutton(data.data, comment_id)
                if (data.data[user_id].includes(parseInt(comment_id))) {
                    $('#moreComment' + comment_id).css({'display' : 'block'})
                }  
            })
        })


        // show delete button when 'more' button is clicked
        more = null

        $(document).on('click', '.delete_comment img', function() {
            let comment_id = $(this).attr('id').replaceAll("moreComment", '')

            if (more != comment_id) {
                $('#deleteButtonID' + more).css({'display' : 'none'})
                $('#moreComment' + more).css({'display' : 'none'})
            }

            more = comment_id

            if ($('#deleteButtonID' + comment_id).css('display') == 'none') {
                $('#deleteButtonID' + comment_id).css({'display' : 'block'})
            }
            else {
                $('#deleteButtonID' + comment_id).css({'display' : 'none'})
            }
        })


        $(document).on('click', function(e) {
            if ($('#deleteButtonID' + more).css('display') == 'block') {
                if (e.target != document.querySelector('#deleteButtonID' + more) && e.target != document.querySelector('#moreComment' + more)) {
                    $('#deleteButtonID' + more).css({'display' : 'none'})
                    $('#moreComment' + more).css({'display' : 'none'})        
                }
            }

        })

        // DELETE COMMENT

        $(document).on('click', '.delete_button p', function() {
            id  = this.id.replaceAll('deleteButtonID', '')
            socket.emit('delete_subComment', {'id' : id})
            //$('#subCommentsID' + id).remove()
        })

        socket.on('delete_subComment', async function(data) {
            $('#deleteButtonID' + data.id).remove()
            $('#subCommentsID' + data.id).fadeOut(500)
            setTimeout(function(){
                $('#subCommentsID' + data.id).remove()
            }, 1000)        
        })
    }

    // LIKE COMMENT //
    function likeComment() {
        $(document).on('click', '.like_button', function() {
            let button_id = this.id.replace('like_buttonID', '')
            if ($(this).css('color') == 'rgb(128, 128, 128)') {
                // INSERT SOCKETIO CODE TO REGISTER like(comment) to database
                socket.emit('update-comment', {'function' : 'like', 'comment_id' : button_id})
                $(this).css('color', 'rgb(0, 155, 226)')
                $('#no_likes_buttonID' + button_id).css('color', 'rgb(0, 155, 226)')

            }
            else {
                // INSERT SOCKETIO CODE TO DEREGISTER like(comment) to database
                socket.emit('update-comment', {'function' : 'unlike', 'comment_id' : button_id})
                $(this).css('color', 'rgb(128, 128, 128)')
                $('#no_likes_buttonID' + button_id).css('color', 'rgb(128, 128, 128)')
            }
        })

        socket.on('update-comment', function(data) {
            if (data.comment_likes[0]['comment_likes']) {
                $('#no_likes_buttonID' + data.comment_id).html(data.comment_likes[0]['comment_likes'])
                //$('#no_likes_buttonID' + data.comment_id).css('visibility', 'visible')
                $('#no_likes_buttonID' + data.comment_id).fadeIn(1)
            }
            else {        
                //$('#no_likes_buttonID' + data.comment_id).html('0')
                //$('#no_likes_buttonID' + data.comment_id).css('visibility', 'hidden')
                $('#no_likes_buttonID' + data.comment_id).fadeOut(1)
            }
        })
    }

    // like (comment) colors on load

    function likeCommentOnload() {
        $.ajax({
            url: '/like-comments-onload',
            get: 'GET',
            contentType: 'application/json',
            beforeSend: function() {
                $('*').css('cursor', 'wait');
            },
            success: function(data) {
                $.each(data.data, function(i) {                   
                    $('#like_buttonID'+data.data[i]['comment_id']).css('color' , 'rgb(0, 155, 226)')
                    $('#no_likes_buttonID' + data.data[i]['comment_id']).css('color', 'rgb(0, 155, 226)')
                   
                })
            },
            complete: function() {
                $('*').css('cursor', '');
            }
        })
    }

    function totalCommentLikes() {
        $.ajax({
            url: '/get-total-comment-likes',
            type: 'GET',
            contentType: 'application/json',
            beforeSend: function() {
                $('*').css('cursor', 'wait')
            },
            success: function(data){
                $.each(data.data, function(i) {
                    if (data.data[i]['comment_likes']) {
                        $('#no_likes_buttonID'+data.data[i]['comment_id']).html(data.data[i]['comment_likes'])
                        $('#no_likes_buttonID'+data.data[i]['comment_id']).css({'display' : 'block'})
                    }
                })
            },
            complete: function() {
                $('*').css('cursor', '')
            }
        })
    }


    

        

    //------------------------------------------------- LIKE POSTS SCRIPT -------------------------------------------------//

    // LIKE POST
    $(document).on('click', '.like-post', function() {
        let like_post_ID = $(this).attr('id').replaceAll('like-postID', '');
        $(this).css({'display' : 'none'});        
        $('#unlike-postID' + like_post_ID).fadeIn(500)
        socket.emit('like_unlike_posts', {'post_id' : like_post_ID, 'what' : 'like'})
    });

    // UNLIKE POST
    $(document).on('click', '.unlike-post', function() {
        let unlike_post_ID = $(this).attr('id').replaceAll('unlike-postID', '');
        $(this).fadeOut(200)
        setTimeout(function(){
            $('#like-postID' + unlike_post_ID).fadeIn(200)
        },190)
        socket.emit('like_unlike_posts', {'post_id' : unlike_post_ID, 'what' : "unlike"})
    })

    socket.on('append_likes_post', function(data){
        $('#post_likes_countID' + data.posts[0]['post_id']).html(data.posts[0]['post_likes'] + ' cheers')
    })


    function likepostUpdate() {
        get_likes = $.ajax({
            url: '/update-post-likes',
            type: 'GET'
        })
        get_likes.done(function(data) {
            for (let i = 0; i < data.data.length; i++) {
                if (data.user_id == data.data[i]['user_id']) {
                    $('#unlike-postID' + data.data[i]['post_id']).css('display', 'block')
                    $('#like-postID' + data.data[i]['post_id']).css('display', 'none')
                }
            }
        })
    }

    //------------------------------------------------- DELETE POSTS SCRIPT -------------------------------------------------//

    more_posts = $.ajax({
                        url: '/more-posts',
                        type: 'GET'
    })

    more_posts.done(function(data) {
        $(document).on('mouseover', '.posts', function() {
            if (data.data.includes(parseInt(this.id))) {
                $('#morePost' + this.id).css({'display' : 'block'})
            }
        })

        $(document).on('mouseleave', '.posts', function() {
            if (data.data.includes(parseInt(this.id))) {
                $('#morePost' + this.id).css({'display' : 'none'})
            }
        })
    })

    $(document).on('click', '.post_deleteButton', function() {
        post_id = this.id.replace('morePost', '')
        socket.emit('delete_post', {'post_id' : post_id})
    })

    socket.on('delete_post', function(data){
        $('#'+data.post_id).fadeOut(500)
        setTimeout(function(){
            $('#'+data.post_id).remove()
        }, 500)

        $('body').css({'overflow' : ''})
        $('.profile-post-wrapper').fadeOut(100)
        setTimeout(function() {
            $('.profile-post').html(null)
        }, 100)
        $('#eachImgContainerID'+data.post_id).fadeOut(100)
        $('#eachImgContainerID'+data.post_id).remove()
    })


    //------------------------------------------------- ADD PHOTO SCRIPT -------------------------------------------------//

    // Ensures that URL is /add-photo

    if (window.location.pathname == '/add-photo') {
        var cropper = ''
        let file_ext = ''
        let photo_filename = ''
        let thumbnail = $('.photo img')[0]
        $(document).on('change', '#photo', function() {

            file = this.files
            photo_filename = file[0].name
            file_ext = photo_filename.split('.')[1]
            ext = ['jpg', 'jpeg', 'png', 'gif', 'svg']


            if (!(ext.includes(file_ext))) {
                alert('Invalid File!')
                $('.photo input').attr('accept', 'image/jpg, image/jpeg, image/png, image/gif image/svg')
            }   
            else {

                if (cropper) {                    
                    cropper.destroy()
                }

                $('.photo img').attr('src', URL.createObjectURL(file[0]))

                if ($(window).outerWidth() > 767) {
                    cropper = new Cropper(thumbnail, {
                        aspectRatio: 10/11,
                        viewMode: 3,
                        responsive: true,
                        minContainerWidth: 480,
                        minContainerHeight: 528,
                        minCropBoxWidth: 480,
                        minCropBoxHeight: 528,
                        //movable: false,
                        guides: false,
                        dragMode: 'move',
                        highlight: false
                        //autoCrop: false
                    })
                }
                else {
                    cropper = new Cropper(thumbnail, {
                        aspectRatio: 10/11,
                        viewMode: 3,
                        responsive: true,
                        minContainerWidth: 320,
                        minContainerHeight: 352,
                        minCropBoxWidth: 320,
                        minCropBoxHeight: 352,
                        //movable: false,
                        guides: false,
                        dragMode: 'move',
                        highlight: false
                        //autoCrop: false
                    })
                }


                $('.wrapper-addphoto form').css({'display' : 'flex'})
                $('form .caption').css({'display' : 'flex'})
                $('form .submit').css({'display' : 'block'})
                $('.add').css({'display' : 'none'})
                // $('.wrapper-addphoto form').css({'padding' : '1.2rem'})
                $('.change_pic').css({'display' : 'block'})


                // $(document).on('click', '.submit input', function(e) {
                    // e.preventDefault()
                    // let image_data = cropper.getCroppedCanvas().toDataURL('image/' + file_ext)
                    // let input_caption = $('.inputcaption').text()        
                    // console.log('aw')       
                    // $.ajax({
                        // url: '/add-photo-ajax',
                        // type: 'POST',
                        // contentType: 'application/json', 
                        // data: JSON.stringify({'caption' : input_caption, 'image_data' : image_data.split(',')[1], 'filename' : photo_filename}),
                        // success: function() {
                            // window.location.pathname = '/'
                        // }
                    // })
                // })

                $(document).on('click', '.change_pic', function() { 
                    $('#photo').val(null)                       
                })

            }
            
        })

        $(document).on('click', '.submit input', function(e) {
            e.preventDefault()
            let image_data = cropper.getCroppedCanvas().toDataURL('image/' + file_ext)
            let input_caption = $('.inputcaption').text()            
            $.ajax({
                url: '/add-photo-ajax',
                type: 'POST',
                contentType: 'application/json', 
                data: JSON.stringify({'caption' : input_caption, 'image_data' : image_data.split(',')[1], 'filename' : photo_filename}),
                success: function() {
                    window.location.pathname = '/'
                }
            })
        })
    }





    //------------------------------------------------- PROFILE SCRIPT -------------------------------------------------//

    if (window.location.pathname.split('/')[1] == 'profile' || window.location.pathname == '/gallery') {

        if ($(window).outerWidth() <= 767) {
            let container = $('.imgContainer').outerWidth()
            let gap = parseFloat($('.imgContainer').css('gap').replace('px', ''))
            $('.profilePhoto-display').width((container - (2 * gap)) / 3)
            $(window).on('resize', function() {           
                let container = $('.imgContainer').outerWidth()
                let gap = parseFloat($('.imgContainer').css('gap').replace('px', ''))
                $('.profilePhoto-display').width((container - (2 * gap)) / 3)
            })

        }
       
    }

    // CHANGE PROFILE PICTURE

    url_username = location[location.length - 1]


    a = $.ajax({
        url: '/profile/getusername',
        type: 'GET',
    })

    a.done(function(data) {
        data_username = data.username[0]['username']

        if (url_username == data_username) {

            $(document).on('mouseover', '.profile-pic .pp, .profile-pic .camera-svg', function() {
                $('.profile-pic .camera-svg').css({'display' : 'block'})
            })
        
            $(document).on('mouseleave','.profile-pic .pp, .profile-pic .camera-svg',  function() {
                $('.profile-pic .camera-svg').css({'display' : 'none'})
            })

        }

    })


    $(document).on('change', '.profile-pic input', function() {
        // var cropper = null
        let photo = this.files[0]
        let pp_ext = photo.name.split('.')[1]
        let thumbnail = document.querySelector('.pp-edit img')
        $('.pp-edit img').attr('src', URL.createObjectURL(photo))
        // $('.wrapper-ppedit').css({'display' : 'flex'})
        $('body').css({'overflow' : 'hidden'})
        

        // if (cropper) {
            // cropper.destroy()
        // }
        
        cropper = new Cropper(thumbnail, {
            aspectRatio: 1 / 1,
            viewMode: 3,
            responsive: true,
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
            //movable: false,
            guides: false,
            dragMode: 'move',
            highlight: false
            //autoCrop: false
        })
        $('.wrapper-ppedit').fadeIn(500)
        $('.wrapper-ppedit').css({'display' : 'flex'})

        $(document).on('click', '.pp-edit button', function() { 
            let pp = cropper.getCroppedCanvas().toDataURL('image/' + pp_ext).split(',')[1]
            a = $.ajax({
                url: '/profile/updatepp',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({'image' : pp, 'filename' : photo.name}),
                beforeSend: function() {
                    $('*').css('cursor', 'wait')
                },
                success: function(data) {
                    $('.profile-pic input').val(null)
                    $('.profile-pic .pp').attr('src', data.path)
                    $('.logo a img').attr('src', data.path)
                    $('.cropper-container').remove()
                    $('.pp-edit img').css({'src' : null})
                    $('.pp-edit img').remove()
                    $('.pp-edit button').remove()
                    ppeditcontent = `
                                    <div class="ppedit_closebutton">
                                        <span class="material-symbols-outlined">
                                            close
                                        </span>
                                    </div>            
                                    <img src="" alt="">
                                    <button>Upload</button>
                    `
                    $('.pp-edit').html(ppeditcontent)
                    cropper.destroy()
                    $('.wrapper-ppedit').css({'display' : 'none'})
                },
                complete: function() {
                    $('*').css('cursor', '')
                }
            })

        })

        $(document).on('click', '.ppedit_closebutton', function() {
            $('.profile-pic input').val(null)
            $('.wrapper-ppedit').css('display', 'none')
            $('.pp-edit img').css('src', 'ATAY')
            $('.cropper-container').remove()
            $('body').css('overflow', '')
            cropper.destroy()
        })

        $(document).on('keydown', '*', function(e) {
            if (e.key == 'Escape') {
                $('.profile-pic input').val(null)
                $('.wrapper-ppedit').css('display', 'none')
                $('.pp-edit img').css('src', null)
                $('.cropper-container').remove()
                cropper.destroy()
            }
        })

    })


    //--- SETTINGS ---//

    // show settings when clicked
    
    $.ajax({
        url: '/settings-show',
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            profile_username = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
            if (data.session_userId == data.data[profile_username]) {
                $('.settings').css('display', 'flex')
            }

        }
    })

    $(document).on('click', function(e) {
        let logout = document.querySelector('.settings-logout')
        let change_pass = document.querySelector('.change-password')
        let settings = document.querySelector('.settings img')
                                
        if (e.target == settings && $('.settingsShow').css('display') == 'none') {
            $('.settingsShow').fadeIn(250)
            $('.settingsShow').css({'display' : 'flex'})
        } 

        else if ((e.target != logout || e.target != change_pass) && $('.settingsShow').css('display') == 'flex') {
            //$('.settingsShow').css({'display' : 'none'})
            $('.settingsShow').fadeOut(150)
          
        }

    })

    // CHANGE PASSWORD

    if (window.location.pathname == '/settings/change-password') {

        $(document).on('click', '.changepass-form [type=submit]', function(e){
            e.preventDefault()
            old_pw = $('#cp-oldpassword').val()
            new_pw = $('#cp-newpassword').val()
            verify_pw = $('#cp-verifypassword').val()
    
    
            if (!old_pw) {
                $('.error_op').fadeIn(500)
                $('.error_unmatched').css('display', 'none')
                $('#cp-newpassword').val(null)
                $('#cp-verifypassword').val(null)
            }
            if(!new_pw) {
    
                $('.error_np').fadeIn(500)
                // $('.np li').css({'display' : 'none'})
                $('.np').css({'margin-top' : '0', 'transition' : ' margin-top 0.3s'})
                $('.np li').css({'color' : '#474747', 'transition' : '0.2s'})
    
            }
            if (!verify_pw) {
                $('.error_vp').fadeIn(500)
                $('.error_vp_unmatched').css('display', 'none')
            }
            if (old_pw) {
                $('.error_op').css('display', 'none')
            }
            if (new_pw) {
                $('.error_np').css('display', 'none')
            }
            if (verify_pw) {
                $('.error_vp').css('display', 'none')
            }
    
            if (old_pw && new_pw && verify_pw) {
            
                a = $.ajax({
                    url: '/settings/change-password/ajax',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {'old_pw' : old_pw, 'new_pw' : new_pw, 'verify_pw' : verify_pw},
                    beforeSend: function() {
                        $('*').css('cursor', 'wait');
                    },
                    success: function(data) {
                        if (!data['result']){
                            $('.error_unmatched').fadeIn(500)
                            $('#cp-newpassword').val(null)
                            $('#cp-verifypassword').val(null)
                            $('.np').css({'margin-top' : '0'})
                        }
                        else {
                            $('.error_unmatched').fadeOut(500)
    
                            if (new_pw.length < 6) {
                                $('.np li').css({'color' : 'red', 'transition' : '0.2s'})
                                $('#cp-newpassword').val(null)
                                $('#cp-verifypassword').val(null)
                            }
                            else {
                                if (new_pw != verify_pw) {
                                    $('.error_vp_unmatched').fadeIn(500)
                                    $('.np li').css({'color' : '#474747'})
                                    $('#cp-newpassword').val(null)
                                    $('#cp-verifypassword').val(null)
                                    $('#cp-oldpassword').val(null)
                                }
                                else {
                                    $('.error_vp_unmatched').css('display', 'none')
    
                                    $.ajax({
                                        url: '/settings/change-password/ajax',
                                        type: 'POST',
                                        contentType: 'application/json',
                                        data: JSON.stringify({'new_pw' : new_pw, 'verify_pw' : verify_pw}),
                                        success: function(data){
                                            $('*').css('cursor', 'wait');
                                            $('.slidedown').fadeIn(300)
                                            $('.slidedown').css('display', 'flex')

                                            setTimeout(function() {
                                                window.location.href = '/'
                                                $('*').css('cursor', 'default');
                                            }, 800)
                                            
                                            
                                        }
                                    })
                                }
                            }
                        }
                    },
                    complete: function(){
                        $('*').css('cursor', 'default');
                    }
                })   

            }                    
        })

    }

    // SHOW imgInfo on HOVER
    $(document).on('mouseenter', '.eachImgContainer', function() {
        img_id = this.id.replace('eachImgContainerID', '')
        // $('#posted_byID'+img_id).fadeIn(250)
        // $('#posted_byID'+img_id).css('display', 'flex')
        $.ajax({
            url: '/get-post-comments-likes',
            type: 'GET',
            contentType: 'application/json',
            data: {'img_id' : img_id},
            success: function(data){

                    $('.no_comments').html(data.comments[0]['comments'])
                    $('.no_likes').html(data.post_likes[0]['post_likes'])
                    $('#profileImgID'+img_id).css({'transform' : 'scale(1.01)', 'box-shadow' : 'rgba(0, 0, 0, 0.24) 0px 3px 8px'})
                    $('#posted_byID'+img_id).css({'transform' : 'scale(1.05)', 'transition' : 'transform 0.3s'})
                    $('#imgInfoID' + img_id).fadeIn(250)
                    $('#imgInfoID' + img_id).css('display' , 'flex')
                    $('.no_comment_like').css('display' , 'flex')
            }            
        })
    })

    $(document).on('mouseleave', '.eachImgContainer', function() {
        img_id = this.id.replace('eachImgContainerID', '')
        $('#profileImgID'+img_id).css({'transform' : 'scale(1)', 'box-shadow' : 'none'})
        $('#posted_byID'+img_id).css('transform' , 'scale(1)')
        // $('#posted_byID'+img_id).css('display', 'none')
        //$('#imgInfoID' + img_id).fadeOut(10)
        $('#imgInfoID' + img_id).css('display' , 'none')
        $('.no_comment_like').remove()

    })

    // SHOWS POST ON CLICK


    $(document).on('click', '.eachImgContainer', function() {
        if ($(window).outerWidth() > 767) {
            $('body').css({'overflow' : 'hidden'})
        }               
        
        // $('.wrapper-content').css({'margin-left' : `${$('.navbar').width()}px`, 'width' : `${$('body').width() - $('.navbar').width()}` + 'px', 'transition' : '0.3s'})
        $('.profile-post-wrapper').css('top', window.scrollY)
        post_id = this.id.replace('eachImgContainerID', '')
        let content = `
            <div class="profile_img_close_button" id="profile_img_close_buttonID${post_id}">
                <span class="material-symbols-outlined">
                    close
                </span>
            </div>   
            <img class='profile_post_img'src="${$('#profileImgID' + post_id).attr('src')}" alt="">
            <div class="posts" id="${post_id}">   
            </div>  
        `

        $('.profile-post').append(content)
        $('.profile-post, .profile-post-wrapper').fadeIn(250)
        $('.profile-post, .profile-post-wrapper').css('display' , 'flex')

        socket.emit('loadpage', {'function' : 'profileLoadComments', 'post_id' : post_id})
    })




    socket.on('profile-load-comments', function(data) {

        for (let post = 0; post < data.posts.length; post++) {
            if (data.posts[post]['post_id'] == parseInt(data.data)){
                let post_caption = `

                    <div class="post_heading_bar">
                        <div class="info_bar">
                            <div class="info_name_dlt">  
                                <a href="/profile/${data.posts[post]['username']}">
                                    <p class="post_name">${data.posts[post]['firstname'] + ' ' + data.posts[post]['surname']}</p>
                                </a>  
                                <div class="delete_post">
                                    <!--<img src="/static/icons/fill_delete_400weight.svg" alt="" id="morePost${data.posts[post]['post_id']}">-->
                                    <span class="material-symbols-outlined post_deleteButton" id="morePost${data.posts[post]['post_id']}">
                                        delete
                                    </span>
                                </div>   
                            </div>                      
                            <p class="post_time" id="postTime${data.posts[post]['post_id']}">${data.post_time[data.posts[post]['post_id']]}</p>
                        </div>
                        <p class="post_caption">${data.posts[post]['caption']}</p>
                        <div class="post-likeDiv">
                            <div class="post-like-button">
                                <img class="like-post" id="like-postID${data.posts[post]['post_id']}" src="/static/icons/hollow_beer_300weight.svg" alt="">
                                <img class="unlike-post" id="unlike-postID${data.posts[post]['post_id']}" src="/static/icons/fill_beer_300weight.svg" alt="">                          
                            </div>     
                            <div class="likes-countDiv">
                                <p class="likes-count" id="post_likes_countID${data.posts[post]['post_id']}">${data.posts[post]['post_likes']} cheers</p>
                            </div>               
                        </div>
                    </div>
                    <div class="comments scrollable" id="commentsID${data.posts[post]['post_id']}">
                    </div>

                `
                $('#' + data.posts[post]['post_id']).append(post_caption)

                for (let comment = 0; comment < data.comments.length; comment++ ) {
                    if (data.posts[post]['post_id'] == data.comments[comment]['post_id']) {
                        
                        let content = `                                                          
                            <div class="sub_comments" id="subCommentsID${data.comments[comment]['comment_id']}">
                                <div class="commentDiv" id="commentDivID${data.comments[comment]['comment_id']}">
                                    <div class="delete_comment">
                                        <div class="delete_button">
                                            <p id="deleteButtonID${data.comments[comment]['comment_id']}">Delete comment</p>
                                        </div>                                                                
                                        <img src="/static/icons/more_horizontal.svg" alt="" id="moreComment${data.comments[comment]['comment_id']}">
                                    </div>
                                    <a href="/profile/${data.username_comment[data.comments[comment]['comment_id']]}">
                                        <p class="comment_name">${data.account_names[data.comments[comment]['user_id']]}</p>
                                    </a>
                                    <p class="comment" role="text">${data.comments[comment]['comment']}</p>
                                </div>
                                <div class="likeDiv">
                                    <p class="no_likes_button" id="no_likes_buttonID${data.comments[comment]['comment_id']}">0</p>
                                    <p class="like_button" id="like_buttonID${data.comments[comment]['comment_id']}">like</p>
                                    <p class="comment_time" id="commentTime${data.comments[comment]['comment_id']}">${data.time[data.comments[comment]['comment_id']]}</p>
                                </div>
                            </div>                                                      
                        `
                        //document.querySelector('.profile-comments').innerHTML += content;
                        $('#commentsID' + data.posts[post]['post_id']).append(content)
                    }
                }

                let add_comment = `
                    <p class="add_comment">Add a comment:</p>
                    <div class="comment_section" id="commentsectionID${data.posts[post]['post_id']}">
                        <span role="text" spellcheck="false" name="add_comment" id="spanID${data.posts[post]['post_id']}" contenteditable="true"></span>
                        <input name="comment" id="commentPostID${data.posts[post]['post_id']}" type="text">
                        <input name="post_id" type="text">
                        <button id="buttonID${data.posts[post]['post_id']}">Send</button>
                    </div>
                `
                $('#' + data.posts[post]['post_id']).append(add_comment)
            }
        }
        let spanMaxWidth = $('.profile-post .posts .comment_section span').outerWidth()
        $('.profile-post .comment_section span').css('max-width' , `${spanMaxWidth}px`)
        likeCommentOnload()
        totalCommentLikes()
        socket.emit('show-more')
        likepostUpdate()
        if ($(window).outerWidth() > 767) {
            postCommentHeight()
        }
        else {
            $('.container-profile').css({'display' : 'none'})
            let y = window.scrollY
            $(document).on('scroll', function() {
                if (y > window.scrollY && $('.container-profile').css('display') == 'none') {
                    window.scrollTo(0, y)
                }
            })

        }

    })
    
    // $(document).on('scroll', function() {
        // console.log(window.scrollY)
    // })
    likepostUpdate()
    likeComment()
    deleteComment()

    $(document).on('click', '.profile_img_close_button', function() {
        if ($(window).outerWidth() <= 767) {
            $('.container-profile').css({'display' : ''})
        }

        $('body').css({'overflow' : ''})
        $('.profile-post-wrapper').fadeOut(100)
        setTimeout(function() {
            $('.profile-post').html(null)
        }, 100)
    })

    function postCommentHeight() {
        totalHeight = $('.profile-post .posts').outerHeight()
        post_headingBar = $('.profile-post .post_heading_bar').outerHeight()
        add_comment = $('.profile-post .add_comment').outerHeight()
        comment_section = $('.profile-post .comment_section').outerHeight()
        height = totalHeight - (post_headingBar + add_comment + comment_section)
        $('.profile-post .comments').height(totalHeight - (post_headingBar + add_comment + comment_section))
        $('.profile-post .comments').css('max-height', `${height}px`)
        
        //$('.profile-post .comments').css({'height' : '63.7dvh'})
    }


    // CLOSE ON ESCAPE
    $(document).on('keydown', function(e) {
        if (e.key == 'Escape') {
            $('.container-profile').css('display', '')
            $('.profile-post-wrapper').fadeOut(100)
            setTimeout(function() {
                $('.profile-post').html(null)
            }, 100)

            $('.searchpopup').animate({
                //marginLeft:  $('.navbar').width()+3 // You can adjust the distance you want to slide
                top: -128
            })
        }
    })


    //------------------------------------------------- SEARCH SCRIPT -------------------------------------------------//

    //$('.searchpopup').css('margin-left', $('.navbar').width()+3)
    //$('.searchpopup').css('margin-top', $('.search a').offset().top)

    $(document).on('click', '.searchCloseDiv', function() {
        $('.search a').css('background', '')
        if ($(window).outerWidth() > 767) {
            $('.searchpopup').animate({
                //marginLeft:  $('.navbar').width()+3 // You can adjust the distance you want to slide
                top: -128
            }) 
        }
        else {
            $('.searchpopup').animate({
                //marginLeft:  $('.navbar').width()+3 // You can adjust the distance you want to slide
                left: -380
            }) 
        }
        

    })

    $(document).on('click', '.search a', function(e) {
        $('.search a').css('background', 'rgba(107, 191, 180, 0.681)')
        e.preventDefault()
        // $('.searchpopup').fadeIn(1)
        if ($(window).outerWidth() > 767) {
            $('.searchpopup').css('margin-left' , $('.navbar').width()+3)
            $('.searchpopup').animate({
                //marginLeft:  $('.navbar').width()+3 // You can adjust the distance you want to slide
                top: 0
            })
        }
        else {

            $('.searchpopup').animate({
                left: 0
                //top: $('.navbar').outerHeight() + 16
            })

        }
        
        $('.searchbar').text(null)

        $('.searchbar').focus()

    })

    $(document).on('input', '.searchbar', function(e) {

        a = $.ajax({
            url: '/search',
            type: 'GET',
            contentType: 'application/json',
            data: {'name' :$('.searchbar').text()},
            success: function(data) {
                if ($('.searchbar').text()) {            
                    if (data != '') {
                        $.each(data.result, function(i) {
                            if ($('.searchResultsDiv a')) {
                                $('.searchResultsDiv a').remove()
                            }

                            $('.searchResultsDiv').fadeIn(200)
                            $('.searchResultsDiv').css('display' , 'flex')
                            content = `   
                            <a href="/profile/${data.result[i]['username']}">                 
                                <div class="searchResults">                            
                                    <p class="searchedName">${data.result[i]['firstname'] +' '+ data.result[i]['surname']}</p>
                                    <p class="searchedUsername">${data.result[i]['username']}</p>                            
                                </div>
                            </a>
                            `
                            $('.searchResultsDiv').append(content)
                        })
                    } 
                    if (data.result == '') {
                        $('.searchResultsDiv').fadeOut(150)
                    }  
                }
                else {
                    $('.searchResultsDiv').fadeOut(150)
                }      
            }
        })
    })

    $(document).on('keypress', '.searchbar', function(e) {
        if (e.key == 'Enter') {
            e.preventDefault()
        }
    })


    $('*').css('cursor' ,'')
});

