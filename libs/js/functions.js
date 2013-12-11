//Reset un formulario
(function( $ ) {
   jQuery.fn.reset = function () {
     $(this).each (function() { 
       this.reset(); 
     });
   }
})( jQuery );

function roundf(numero, lugares_decimales){
  var p = Math.pow(10, lugares_decimales);
  return Math.round(numero * p) / p;
}

/*
 * Comprobar una variable definida JS
 * isDefined("nombre_variable")s;
 */ 
function isDefined( variable) { return (typeof(window[variable]) != "undefined");}

/*
 * Comprueba si la variable esta definita y en dado caso, la utiliza
 * canUseVar(variable);
 */ 
function canUseVar(variable) {
   if (typeof variable == "undefined"){
      return "--";
   } else {
      return variable;
      //return true;
   }
}

/*
 * Precarga de imagenes
 * jQuery.preLoadImages("la_ruta_a_tu_imagen/tuimagen.jpg", "la_ruta_a_tu_imagen2/tuimagen2.jpg");
 */ 
(function($) {
  var cache = [];
  // Arguments are image paths relative to the current page.
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  }
})(jQuery);

(function( $ ) {
   $.fn.validCampo = function(cadena) {
      $(this).on({
         keypress : function(e){
            var key = e.which,
               keye = e.keyCode,
               tecla = String.fromCharCode(key).toLowerCase(),
               letras = cadena;
             if(letras.indexOf(tecla)==-1 && keye!=9&& (key==37 || keye!=37)&& (keye!=39 || key==39) && keye!=8 && (keye!=46 || key==46) || key==161){
               e.preventDefault();
             }
         }
      });
   };
})( jQuery );

$.ajaxSetup({
   url: 'systemHandler.php',
   //contentType: "application/json; charset=utf-8",
   dataType: 'json',
   type: 'post',
   async: true,
   error: function (jqXHR, textStatus, errorThrown){
        $.unblockUI();
        
        showDialog(
            ':: Error ::', 
            '<strong>' + textStatus + '</strong> (' + errorThrown + ')' + '<br /><br /><strong>readyState: </strong>'+ jqXHR.readyState +'<br /><strong>responseText: </strong><pre>'+ jqXHR.responseText +'</pre><br /><strong>status: </strong>'+ jqXHR.status +'<br /><strong>statusText: </strong>'+ jqXHR.statusText,
             'icon-warning-sign', { 
                 Ok: function() { 
                     $(this).dialog('close');
                 }
             }
        );
   },
   beforeSend: function() {
      //Bloqueamos la Pantalla
      $.blockUI({
         theme: true,
         draggable: false,
         themedCSS: { 
            //width:  '70%', 
            top:    '40%', 
            //left:   '60%',
            textAlign: 'center',
            '-webkit-border-radius': '7px', 
            '-moz-border-radius': '7px'
         },
         message: "<div><span style='padding:0px 10px'><img src='img/preloader15x15.png' /></span><span id='msgPopup'>Procesando lo más rápido posible.</span></div>"
      });
   },
   complete: function (jqXHR, textStatus){
      //console.log(jqXHR);
      $.unblockUI();
   }
});

function myCombobox(selectorID, objAction){
  switch ($.trim(objAction.action.toLowerCase())){
    case "block":
      $(selectorID)
        .parent()
        .find('input.ui-autocomplete-input')
        .autocomplete('option', 'disabled', true)
        .prop('disabled',true);
      $(selectorID).parent().find('a.ui-button').button('disable');
      break;
    case "unblock":
      $(selectorID)
        .parent()
        .find('input.ui-autocomplete-input')
        .autocomplete('option', 'disabled', false)
        .prop('disabled',false);
      $(selectorID).parent().find('a.ui-button').button('enable');
      break;
    case "getValue":
      $(selectorID + ' option:selected').text();
      break;
    case "setValue":
      $(selectorID)
        .val(objAction.index)
        .siblings('.ui-combobox')
        .find('.ui-autocomplete-input')
        .val($(selectorID + ' option:selected').text());
      break;
  }
}

(function( $ ) {
   $.widget( "ui.combobox", {
      _create: function() {
         this.wrapper = $( "<span>" )
         .addClass( "ui-combobox" )
         .insertAfter( this.element );
         this._createAutocomplete();
         this._createShowAllButton();
      },
      
      _createAutocomplete: function() {
         var selected = this.element.children( ":selected" ),
         value = selected.val() ? selected.text() : "";
         this.input = $( "<input>" )
            .appendTo( this.wrapper )
            .val( value )
            .attr( "title", "" )
            .addClass( "ui-state-default ui-combobox-input ui-widget ui-widget-content ui-corner-left" )
            .autocomplete({
               delay: 0,
               minLength: 0,
               source: $.proxy( this, "_source" )
            })
            .tooltip({
               tooltipClass: "ui-state-highlight"
            });
         this._on( this.input, {
            autocompleteselect: function( event, ui ) {
               changeComboUI(event, ui);
               
               ui.item.option.selected = true;
               this._trigger( "select", event, {
                  item: ui.item.option
               });
            },
            autocompletechange: "_removeIfInvalid"
         });
      },
      
      _createShowAllButton: function() {
         var input = this.input,
             wasOpen = false;
         
         $( "<a>" )
            .attr( "tabIndex", -1 )
            .attr( "title", "Show All Items" )
            .tooltip()
            .appendTo( this.wrapper )
            .button({
               icons: {
                  primary: "ui-icon-triangle-1-s"
               },
               text: false
            })
            .removeClass( "ui-corner-all" )
            .addClass( "ui-corner-right ui-combobox-toggle" )
            .mousedown(function() {
               wasOpen = input.autocomplete( "widget" ).is( ":visible" );
            })
            .click(function() {
               input.focus();
               // Close if already visible
               if ( wasOpen ) {
                  return;
               }
               // Pass empty string as value to search for, displaying all results
               input.autocomplete( "search", "" );
            });
      },
      
      _source: function( request, response ) {
         var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
         response( this.element.children( "option" ).map(function() {
            var text = $( this ).text();
            if ( this.value && ( !request.term || matcher.test(text) ) )
               return {
                  label: text,
                  value: text,
                  option: this
               };
         }));
      },
      
      _removeIfInvalid: function( event, ui ) {
         // Selected an item, nothing to do
         if ( ui.item ) {
            return;
         }
         // Search for a match (case-insensitive)
         var value = this.input.val(),
         valueLowerCase = value.toLowerCase(),
         valid = false;
         this.element.children( "option" ).each(function() {
            if ( $( this ).text().toLowerCase() === valueLowerCase ) {
               this.selected = valid = true;
               return false;
            }
         });
         // Found a match, nothing to do
         if ( valid ) {
            return;
         }
         // Remove invalid value
         this.input
            .val( "" )
            .attr( "title", value + " didn't match any item" )
            .tooltip( "open" );
         this.element.val( "" );
         this._delay(function() {
            this.input.tooltip( "close" ).attr( "title", "" );
         }, 2500 );
         this.input.data( "ui-autocomplete" ).term = "";
      },
      
      _destroy: function() {
         this.wrapper.remove();
         this.element.show();
      }
   });
})( jQuery );

//Mostras captcha con Ajax
function showRecaptcha(element) {
   Recaptcha.create(captchaPublicKey, element, {
   theme    : 'white',
   lang     : 'es',
   tabindex : 0
   //callback : Recaptcha.focus_response_field
   });
}

/*
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
function dump(arr,level) {
   var dumped_text = "";
   if(!level) level = 0;
   
   //The padding given at the beginning of the line.
   var level_padding = "";
   for(var j=0;j<level+1;j++) level_padding += "    ";
   
   if(typeof(arr) == 'object') { //Array/Hashes/Objects 
      for(var item in arr) {
         var value = arr[item];
         
         if(typeof(value) == 'object') { //If it is an array,
            dumped_text += level_padding + "'" + item + "' ...\n";
            dumped_text += dump(value,level+1);
         } else {
            dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
         }
      }
   } else { //Stings/Chars/Numbers etc.
      dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
   }
   return dumped_text;
}



//Mensaje estilo de Error jQueryUI
jQuery.fn.asError = function() {
    return this.each(function() {
        $(this).replaceWith(function(i, html) {
            var newHtml = "<div class='ui-state-error ui-corner-all' style='padding: 0 .7em;'>";
            newHtml += "<p><span class='ui-icon ui-icon-alert' style='float: left; margin-right: .3em;'>";
            newHtml += "</span>";
            newHtml += html;
            newHtml += "</p></div>";
            return newHtml;
        });
    });
};
 
//Mensaje estilo de Advertencia jQueryUI
jQuery.fn.asHighlight = function() {
    return this.each(function() {
        $(this).replaceWith(function(i, html) {
            var newHtml = "<div class='ui-state-highlight ui-corner-all' style='padding: 0 .7em;'>";
            newHtml += "<p><span class='ui-icon ui-icon-info' style='float: left; margin-right: .3em;'>";
            newHtml += "</span>";
            newHtml += html;
            newHtml += "</p></div>";
            return newHtml;
        });
    });
};

function showDialog(strTitle, msg, icon, addButtons) {
   /*
    * Uso:
    * showDialog(':: Error ::', 'Aqu? la desc del err, puede ser codigo html', 'icono jQueryUI');
    *
    * icons:
    * icon-check-sign -> Paloma OK
    * icon-warning-sign -> Admiraci?n Alert
    * icon-info-sign -> Admiraci?n de Infomaci?n
    *
   */
   var objMessage = $("<div><p><span class='icon-stack'><i class='icon-check-empty icon-stack-base'></i><i class='"+icon+"'></i></span> "+ msg +"</p></div>");
   objMessage.dialog({
      modal: true,
      width: 550,
      maxWidth: 800,
      maxHeight: 520,
      resizable: false,
      title: strTitle,
      show: {
         effect: 'puff', //"highlight",
         duration: 'fast' //1000
      },
      hide: {
         effect: 'puff', //"explode",
         duration: 'fast' //1000
      },
      buttons: addButtons
      /*
      buttons: {
         Ok: function() {
            $(this).dialog('close');
         }
      }
      */
   });
}


/*
 * Obtiene el valor de las variables GET de la p?gina actual o
 * pasada por parametro.
 * gup(urlStr, nameVar);  gup(nameVarGet)
 * credits: http://www.netlobo.com/url_query_string_javascript.html
 */
function gup(name, url) {
   name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
   url = url || window.location.href;
   var regexS = "[\\#&]"+name+"=([^&#]*)";
   var regex = new RegExp( regexS );
   var results = regex.exec( url );
   
   if( results == null ) {
       return "";
   } else {
       return results[1];
   }
}

function getParent($this) {
  var selector = $this.attr('data-target')
    , $parent

  if (!selector) {
    selector = $this.attr('href')
    selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
  }

  $parent = selector && $(selector)

  if (!$parent || !$parent.length) $parent = $this.parent()

  return $parent
}

/*
 * Obtiene el tamaño total actual de la ventana o viewport
 * var Tam = TamVentana();
 * 'La ventana mide: [' + Tam[0] + ', ' + Tam[1] + ']'
 *
 */
function TamVentana() {
   var Tamanyo = [0, 0];
   if (typeof window.innerWidth != 'undefined') {
      Tamanyo = [
         window.innerWidth,
         window.innerHeight
      ];
   } else if (typeof document.documentElement != 'undefined' &&
              typeof document.documentElement.clientWidth !=
              'undefined' && document.documentElement.clientWidth != 0) {
      Tamanyo = [
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      ];
   } else {
      Tamanyo = [
         document.getElementsByTagName('body')[0].clientWidth,
         document.getElementsByTagName('body')[0].clientHeight
      ];
   }
   return Tamanyo;
}

/*
 * Configuración para el DataPicker de jQuery
 */
var dataSettings = {
   monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
   monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Act', 'Nov', 'Dic'],
   dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
   dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
   dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
   dateFormat: 'dd-mm-yy',
   showOtherMonths: true,
   selectOtherMonths: false,
   showWeek: false,
   firstDay: 1,
   changeMonth: false,
   changeYear: false
};
//$.datepicker.setDefaults(dataSettings);


function utf8_decode (str_data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // +      input by: Aman Gupta
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Norman "zEh" Fuchs
  // +   bugfixed by: hitwork
  // +   bugfixed by: Onno Marsman
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: kirilloid
  // *     example 1: utf8_decode('Kevin van Zonneveld');
  // *     returns 1: 'Kevin van Zonneveld'

  var tmp_arr = [],
    i = 0,
    ac = 0,
    c1 = 0,
    c2 = 0,
    c3 = 0,
    c4 = 0;

  str_data += '';

  while (i < str_data.length) {
    c1 = str_data.charCodeAt(i);
    if (c1 <= 191) {
      tmp_arr[ac++] = String.fromCharCode(c1);
      i++;
    } else if (c1 <= 223) {
      c2 = str_data.charCodeAt(i + 1);
      tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      i += 2;
    } else if (c1 <= 239) {
      // http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
      c2 = str_data.charCodeAt(i + 1);
      c3 = str_data.charCodeAt(i + 2);
      tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    } else {
      c2 = str_data.charCodeAt(i + 1);
      c3 = str_data.charCodeAt(i + 2);
      c4 = str_data.charCodeAt(i + 3);
      c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
      c1 -= 0x10000;
      tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1>>10) & 0x3FF));
      tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
      i += 4;
    }
  }

  return tmp_arr.join('');
}


function utf8_encode (argString) {
  // http://kevin.vanzonneveld.net
  // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: sowberry
  // +    tweaked by: Jack
  // +   bugfixed by: Onno Marsman
  // +   improved by: Yves Sucaet
  // +   bugfixed by: Onno Marsman
  // +   bugfixed by: Ulrich
  // +   bugfixed by: Rafal Kukawski
  // +   improved by: kirilloid
  // +   bugfixed by: kirilloid
  // *     example 1: utf8_encode('Kevin van Zonneveld');
  // *     returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === "undefined") {
    return "";
  }

  var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
         (c1 >> 6)        | 192,
        ( c1        & 63) | 128
      );
    } else if (c1 & 0xF800 != 0xD800) {
      enc = String.fromCharCode(
         (c1 >> 12)       | 224,
        ((c1 >> 6)  & 63) | 128,
        ( c1        & 63) | 128
      );
    } else { // surrogate pairs
      if (c1 & 0xFC00 != 0xD800) { throw new RangeError("Unmatched trail surrogate at " + n); }
      var c2 = string.charCodeAt(++n);
      if (c2 & 0xFC00 != 0xDC00) { throw new RangeError("Unmatched lead surrogate at " + (n-1)); }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
         (c1 >> 18)       | 240,
        ((c1 >> 12) & 63) | 128,
        ((c1 >> 6)  & 63) | 128,
        ( c1        & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}