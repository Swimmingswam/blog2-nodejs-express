$(function () {
    var loginbox = $('#login');
    var registerbox = $('#register');
    var userinfo = $('#userinfo');
    var loginout = $('#loginout');

    //进入注册面板
    loginbox.find('a').on('click', function (e) {
        e.preventDefault();
        registerbox.show()
        loginbox.hide()
    })

    //进入登录面板
    registerbox.find('a').on('click', function (e) {
        e.preventDefault();
        loginbox.show()
        registerbox.hide()
    })

    //点击注册，提交表单
    registerbox.find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: registerbox.find('[name="username"]').val(),
                password: registerbox.find('[name="password"]').val(),
                repassword: registerbox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function (res) {
                var info = registerbox.find('#info').html(res.message)  //提示信息
                if (res.code == 200) {   //服务器返回200表示注册成功，1秒后显示隐藏登录和注册
                    setTimeout(() => {
                        loginbox.show()
                        registerbox.hide()
                    }, 1000);
                }
            }
        })
    })

    //点击登录，提交表单
    loginbox.find('button').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: loginbox.find('[name="username"]').val(),
                password: loginbox.find('[name="password"]').val(),
            },
            dataType: 'json',
            success: function (res) {
                if (res.code == 200) {
                    window.location.reload()      //页面重新加载
                }
            }
        })
    })

    //点击退出登录
    loginout.find('a').on('click', function () {
        $.ajax({
            url: '/api/user/logout',
            success: function (res) {
                if (!res.code) {
                    window.location.reload()  //页面重新加载
                }
            }
        })
    })
})