import 'owl.carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import '../../node_modules/slick-carousel'
import '../css/style.css';

  $(document).ready(function () {
    var w = $(window).outerWidth();
    var h = $(window).outerHeight();
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function () {
        return (
          isMobile.Android() ||
          isMobile.BlackBerry() ||
          isMobile.iOS() ||
          isMobile.Opera() ||
          isMobile.Windows()
        );
      },
    };
    function isIE() {
      ua = navigator.userAgent;
      var is_ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
      return is_ie;
    }
    if (isIE()) {
      $('body').addClass('ie');
    }
    if (isMobile.any()) {
      $('body').addClass('touch');
    }

    //Slider gallery
    $('.carousel-1').owlCarousel({
      loop: true,
      stagePadding: 70,
      nav: true,
      dots: false,
      navText: ['&lsaquo;', '&rsaquo;'],
      responsive: {
        0: { items: 1 },
        500: { items: 2 },
        992: { items: 3 },
        1200: { items: 4 },
        1600: { items: 5 },
      },
    });

    //SLIDERS
    if ($('.slider__body').length > 0) {
      $('.slider__body').slick({
        dots: true,
        arrows: false,
        accessibility: false,
        slidesToShow: 1,
        autoplaySpeed: 3000,
        adaptiveHeight: true,
        nextArrow: '<button type="button" class="slick-next"></button>',
        prevArrow: '<button type="button" class="slick-prev"></button>',
        responsive: [
          {
            breakpoint: 768,
            settings: {},
          },
        ],
      });
    }

    $('.wrapper').addClass('loaded');

    function ibg() {
      $.each($('.ibg'), function (index, val) {
        if ($(this).find('img').length > 0) {
          $(this).css(
            'background-image',
            'url("' + $(this).find('img').attr('src') + '")'
          );
        }
      });
    }
    ibg();
  });

  // Меню бургер
  const iconMenu = document.querySelector('.menu__icon');
  const menuBody = document.querySelector('.menu__body');
  if (iconMenu) {
    iconMenu.addEventListener('click', function (e) {
      document.body.classList.toggle('_lock');
      iconMenu.classList.toggle('_active');
      menuBody.classList.toggle('_active');
    });
  }

  // Прокрутка при клике

  const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
  if (menuLinks.length > 0) {
    menuLinks.forEach((menuLink) => {
      menuLink.addEventListener('click', onMenuLinkClick);
    });

    function onMenuLinkClick(e) {
      const menuLink = e.target;
      if (
        menuLink.dataset.goto &&
        document.querySelector(menuLink.dataset.goto)
      ) {
        const gotoBlock = document.querySelector(menuLink.dataset.goto);
        const gotoBlockValue =
          gotoBlock.getBoundingClientRect().top + pageYOffset;

        if (iconMenu.classList.contains('_active')) {
          document.body.classList.remove('_lock');
          iconMenu.classList.remove('_active');
          menuBody.classList.remove('_active');
        }

        window.scrollTo({
          top: gotoBlockValue,
          behavior: 'smooth',
        });
        e.preventDefault();
      }
    }
  }

  $('body').append('<div class="upbtn"></div>');
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.upbtn').css({
        bottom: '15px',
      });
    } else {
      $('.upbtn').css({
        bottom: '-80px',
      });
    }
  });
  $('.upbtn').on('click', function () {
    $('html, body').animate(
      {
        scrollTop: 0,
      },
      500
    );
    return false;
  });

  $(".scrollto").on("click", function () {
    console.log('Hello!');
    let href = $(this).attr("href");

    $("html, body").animate({
        scrollTop: $(href).offset().top
    }, {
        duration: 370,   // по умолчанию «400»
        easing: "linear" // по умолчанию «swing»
    });

    return false;
});






