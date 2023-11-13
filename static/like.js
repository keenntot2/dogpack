document.addEventListener('DOMContentLoaded', function() {

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


    // LIKE POST
    $(document).on('click', '.like-post', function() {
        let like_post_ID = $(this).attr('id').replaceAll('like-postID', '');
        $(this).css({'display' : 'none'});
        $('#unlike-postID' + like_post_ID).css({'display' : 'block'});


        //$.ajax({
        //    url: '/update-post-likes',
        //    type: 'POST',
        //    contentType: 'application/json',
        //    data: JSON.stringify({post_id : like_post_ID})
        //    
        //});
    });



    // UNLIKE POST
    $(document).on('click', '.unlike-post', function() {
        let unlike_post_ID = $(this).attr('id').replaceAll('unlike-postID', '');
        $(this).css('display', 'none');
        $('#like-postID' + unlike_post_ID).css('display', 'block');

        //$.ajax({
        //    url: '/unlike-post',
        //    type: 'POST',
        //    contentType: 'application/json',
        //    data: JSON.stringify({ id : unlike_post_ID })
        //});
    })

});