var limit = 2
var comments = []
var currentpage = 1

$('#submit').on('click',function(){
    $.ajax({
        type: 'post',
        url: '/api/comment/post',
        data: {
            content: $('#commentcontent').val(),
            contentid: $('#commentid').val()
        },
        dataType: 'json',
        success: function (res) {
            $('#commentcontent').val('') 
            if(res.code == '1'){
                $('#error').html(res.message)
            }else{
                $('#error').hide()
            }
            comments = res.data.comments.reverse()
            rendercomments()
        }
    })
})
$.ajax({
    type: 'get',
    url: '/api/comment',
    data: {
        contentid: $('#commentid').val()
    },
    dataType: 'json',
    success: function (res) {
        comments = res.data.reverse()
        rendercomments()
    }
})
$('#pageul').delegate('a','click',function(){
    if($(this).parent().hasClass('previous')){
        currentpage--
    }else{
        currentpage++
    }
    rendercomments()
})


function rendercomments(){
    $('#commentscount').html(comments.length)
    var pages = Math.max(Math.ceil(comments.length / limit),1)
    var lists = $('#pageul li')
    if (currentpage <= 1){
        lists.eq(0).html('<span>没有上一页了</span>') 
    }else{
        lists.eq(0).html('<a>上一页</a>') 
    }
    if (currentpage >= pages){
        lists.eq(2).html('<span>没有下一页了</span>') 
    }else{
        lists.eq(2).html('<a>下一页</a>') 
    }
    var start = Math.max((currentpage-1)*limit,0);
    var end = Math.min(start + limit,comments.length);
    lists.eq(1).html(currentpage + '/' + pages)
    var html = ''
    if(comments.length == 0){
        html = '<li>当前评论为空</li>'
    }else{
        for(var k = start;k < end; k++){
            html += '<li><h4>'+ comments[k].username + '<span>'+timeformate(comments[k].postTime)+'</span></h4><p>'+comments[k].content+'</p></li>'
        }
    }
    $('#comment').html(html)
}

function timeformate(d){
    var day = new Date(d);
    return day.getFullYear()+'年'+(day.getMonth()+1)+'月'+day.getDay()+'日'+" "+day.getHours()+":"+day.getMinutes()+":"+day.getSeconds()
}