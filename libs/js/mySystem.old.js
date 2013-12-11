// VARIABLES GLOBALES
var undef

/**
 * CONFIEZO (NO MIENTO) DE VERAS TE HAMÉ, ASÍ CON "H" PQ FUE UN ERROR ='(
 * SINRIÉ BONITA, YO INVITO =D
 * ACEPTAR, SUSPIRAR, VOLVERSE A ILUSIONAR ¿QUEDA OTRO REMEDIO?
 * ERES LA CASUALIDAD MÁS LINDA DE MI VIDA
 * ESTAMOS A NADA DE SERLO TODO
 * DECIR TU NOMBRE ES DELETREAR MI DESTINO
 * AL FIN SOLOS, AL FIN SOMOS
 * TAMBIÉN CREO EN EL AMOR A PRIMERA RISA
 * SOMOS DEMASIADO JOVENES PARA SER TAN INFELICES
 */

/**
 * [onbeforeunload: función antes de salir de la app]
 * @param  {obj} e [event handler]
 * @return {str}  [mensaje a desplegar para el usuario si existe]
 */
window.onbeforeunload = function (e) {
    var message = 'Estas completamente seguro?' 
    var e = e || window.event
    // For IE and Firefox prior to version 4
    if (e) {
        //e.returnValue = message 
    }
    // For Safari
    //return message
}

/*
 * ARRANCAR EL SISTEMA 
 */
$(document).on('ready', function(e){
    mySystem.onReady()
})


/**
 * [mySystem: System Handler Object as Function]
 * @type {Object}
 */
mySystem = {
    // VARIABLES
    windowSize    : TamVentana(),
    isChrome      : /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()),
    continueAjax  : false,
    urlSam_load   : 'http://cobaes.info/sam/Mapas/func_pide.ashx',
    urlLocal_load : 'data.v3.json',
    dataFiltros   : {},
    activeFiltros : {},

    /**
     * [onReady Inicializan todo el sistema]
     */
    onReady: function(){
        $(".navbar a").tooltip({
            position: {
                my: "center bottom-10",
                at: "center top",
                using: function( position, feedback ) {
                    $( this ).css( position )
                    $( "<div>" )
                        .addClass( "arrow bottom" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this )
                }
            }
        })

        // Inicia todo lo relacionado con los Menus de Bootstrap
        this.btDropdownCustom()
    },

    resetSystem: function(){
        // OPERACION DE FILTROS [Lineas >> Acciones >> (*) Metas >> Programas >> Proyectos >> Indicadores]
        var $lineas = $("ul[isFilter='lineas'] li li"),
            $acciones = $("ul[isFilter='acciones'] li li"),
            $programas = $("ul[isFilter='programas'] li li"),
            $proyectos = $("ul[isFilter='proyectos'] li li")

        $(".dropdown li a").off("click");
        $(".dropdown li").off("hover");
        $(".dropdown input[type='text']").off("change")
        //$(".dropdown li a").remove();
        
        //ToolTip de las filtros
        $(".dropdown li a").tooltip({
            position: {
                my: "left+8 left",
                at: "right center",
                using: function( position, feedback ) {
                    $( this ).css( position );
                    $( "<div>" )
                        .addClass( "arrow left" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this );
                }
            }
        });
        
        // Para que se seleccione el texto dentro del campo text
        $(".dropdown input[type='text']").on("click", function(){
            this.select();
        });

        //Limpiando las cajas de texto
        $("ul[isFilter] .search input").val("");

        // Controlando que todo el LI checkee el checkbox
        $(".dropdown li a").on("click", function(e){
            var $chk = $(this).find("input[type='checkbox']")

            if ($chk.prop('checked')){
                $chk.prop('checked', false)
            } else {
                $chk.prop('checked', true)
            }
        })

        // Interactando los LI para que no desaparescan si tienen un INPUT
        $(".dropdown li").hover(
            function(e) {
                //console.log( "hover IN", $( this ), $( this ).parents(".dropdown") )
                if ($( this ).find("input").length){
                    $( this ).parents(".dropdown").addClass( "customOpen" )    
                }
            }, 
            function(e) {
                //console.log("hover OUT")
                if ($( this ).find("input").length){
                    $( this ).parents(".dropdown").removeClass( "customOpen" )
                    $( this ).parents(".dropdown").addClass( "open" )
                }
            }
        )

        // Haciendo el search, si queda será una chulada ;)
        $(".dropdown input[type='text']").on("keyup", function(e){
            var term = this.value.toLowerCase(),
                dataSearch = [],
                $liElements = $(this).parents(".dropdown-menu").find("li").not(".search"),
                nameFilter = $(this).parents("ul[isFilter]").attr("isFilter");

            // Es basura pero sirve como ejemplo
            var names = [ 
                { id: "1", value : "Jörn Zaefferer", email : "suprem.angel@gmail.com" }, 
                { id: "2", value : "Scott González", email : "scott@gmail.com" }, 
                { id: "3", value : "John Resig", email : "john@gmail.com" }, 
                { id: "4", value : "ActionScript", email : "actionscript@gmail.com" }
            ];

            // Desmarcando y ocultando todos los filtros delegados del actual
            switch(nameFilter){
                case "lineas":
                    $acciones.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $programas.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break;
                case "acciones":
                    $programas.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break;
                case "programas":
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break;
                case "proyectos":
                    break;
            }
            // Navegando y recoiendo todos los valores de cada opción checkbox
            $liElements
                .each(function(i, value){
                    var newData = {},
                        $this = $(this),
                        $input = $this.find("input")
                    
                    newData["id"] = $input.attr('id').toLowerCase()
                    newData["value"] = $this.text().toLowerCase()
                    newData["value2"] = $input.val().toLowerCase()
                    newData["value3"] = $this.attr('title').toLowerCase()
                    
                    //console.log(i, value, $(this), newData)
                    dataSearch.push(newData)
                })

            /**
             * [accentMap Mapa de letras para omitir acentos]
             * @type {Object}
             */
            var accentMap = {
                "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ä": "a", 
                "ë": "e", "ï": "i", "ö": "o", "ü": "u", "à": "a", "è": "e", 
                "ì": "i", "ò": "o", "ù": "u", "â": "a", "ê": "e", "î": "i", 
                "ô": "o", "û": "u", "Ð" : "ñ"
            }

            /**
             * [normalize Cambia los acentos por su equivalente sin acentos]
             * @param  {[type]} term [Cadena con acentos]
             * @return {[type]}      [Cadena sin acentos]
             */
            var normalize = function( term ) {
                var ret = ""
                for ( var i = 0; i < term.length; i++ ) {
                    //console.log(accentMap[ term.charAt(i) ], term.charAt(i))
                    ret += accentMap[ term.charAt(i) ] || term.charAt(i)
                }
                return ret
            }

            /**
             * [response lleva acabo las operaciones de filtro al DOM]
             * @param  {[type]} data [description]
             * @return {[type]}      [description]
             */
            var response = function(data) {
                var $element
                
                $liElements.find("input").prop('checked', false);
                $liElements.hide()
                $.each(data, function(i, value){
                    $element = $("#"+value.id).parents('li li')
                    $element.show();

                    //console.log($element)
                })
            }

            /**
             *  [Lleva a cabo las operaciones de filtro (tipo backend)]
             */
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" )
            var valor = "";
            response($.grep( dataSearch, function( value ) {
                valor = value.value || value.value2 || value.id
                //console.log(matcher, value.value);
                return matcher.test( valor ) || 
                       matcher.test( normalize( valor ) ) ||
                       matcher.test( normalize( value.value2 ) ) ||
                       matcher.test( normalize( value.value3 ) )
            }))
        })

        $("ul[isFilter] li li").not(".search").on("click", 
            function(e){
                var $element = $(this),
                    $filter = $element.parents("ul[isFilter]").attr("isFilter"),
                    $onChecks = $element.parents(".filtro").find("input:checkbox:checked")
                //console.log($element, $filter, $onChecks);
                
                // ACTUALIZANDO LOS FILTROS
                switch($filter){
                    case "lineas":
                        $acciones
                            // Desmarca y Oculta
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            // Limpia Search
                            .parents("ul ul").find(".search input").val("")
                        $programas
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")
                        $proyectos
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")

                        // Muestra las acciones que corresponden con las lineas
                        $.each($onChecks, function(i, value){
                            $.each(mySystem.dataFiltros[this.value].acciones, function(j, key){
                                $acciones.not(".search").find("input[value='"+j+"']").parents("li li").show()
                            })
                        })
                        break
                    case "acciones":
                        $programas
                            // Desmarca y Oculta
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            // Limpia Search
                            .parents("ul ul").find(".search input").val("")
                        $proyectos
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")

                        // Muestra los programas que corresponden con las acciones
                        $lineas.find("input:checkbox:checked").each(function (i, value){
                            //console.log(this.value, i);
                            var linea = this.value

                            //acciones
                            $.each($onChecks, function(j, val){
                                //console.log(linea, j, val, this.value)
                                var meta = this.value

                                $.each(mySystem.dataFiltros[linea].acciones[meta].metas, function(k, v){
                                    //console.log(k, v)
                                    var programas = k

                                    $.each(mySystem.dataFiltros[linea].acciones[meta].metas[k].programas, 
                                        function(l, key) {
                                            $programas
                                                .not(".search")
                                                .find("input[value='"+l+"']")
                                                .parents("li li")
                                                .show()
                                        }
                                    )
                                    //$acciones.not(".search").find("input[value='"+k+"']").parents("li li").show()
                                })
                            })
                        })

                        
                        break
                    case "programas":
                        $proyectos
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")

                        $lineas.find("input:checkbox:checked").each(function (i, value){
                            var linea = this.value

                            $acciones.find("input:checkbox:checked").each(function (j, val){
                                var accion = this.value

                                $.each(mySystem.dataFiltros[linea].acciones[accion].metas, function(k, v){
                                    var meta = k

                                    //Programas
                                    $.each(mySystem.dataFiltros[linea].acciones[accion].metas[meta].programas,
                                        function(l, key) {

                                            $.each($onChecks, function(m, key2){
                                                var programa = this.value

                                                console.log(
                                                        "linea: " + linea, 
                                                        "accion: " + accion, 
                                                        "meta: " + meta, 
                                                        "programa: " + programa
                                                    )
                                                $.each(mySystem.dataFiltros[linea].acciones[accion].metas[meta].programas[programa].proyectos, function(n, key3){
                                                    var proyecto = n
                                                    /*
                                                    console.log(
                                                        "linea: " + linea, 
                                                        "accion: " + accion, 
                                                        "meta: " + meta, 
                                                        "programa: " + programa, 
                                                        "proyecto: " + proyecto
                                                    )*/

                                                    $proyectos
                                                        .not(".search")
                                                        .find("input[value='"+proyecto+"']")
                                                        .parents("li li")
                                                        .show()
                                                })

                                               
                                            })
                                        }
                                    )
                                })
                            })
                        })

                        break
                    case "proyectos":
                        // ...
                        break
                }
                
            }
        )
    },

    btDropdownCustom: function(){
        $.ajax({
            data: { 'action' : 'load' },
            url : this.urlLocal_load,
            success: function(data) {
                var dataMenuLineas = '',
                    dataMenuAcciones = '',
                    dataMenuMetas = '',
                    dataMenuProgramas = '',
                    dataMenuProyectos = ''
                //console.log(data)

                if (!data.anyErr){
                    mySystem.dataFiltros = data["lineas"]

                    $.each(mySystem.dataFiltros, function(i, value){
                        //console.log(i, this)
                        dataMenuLineas += " \
                        <li title='"+value.desc+"'><a title='"+value.desc+"'> \
                            <input type='checkbox' value='"+value.indice+"' name='"+value.indice+"' id='"+value.indice+"' /> "+value.tipo+" "+value.indice+" \
                        </a></li>"
                        $.each(mySystem.dataFiltros[i].acciones, function(j, val){
                            dataMenuAcciones += " \
                                <li title='"+val.desc+"'><a title='"+val.desc+"'> \
                                    <input type='checkbox' value='"+val.indice+"' name='"+val.indice+"' id='"+val.indice+"' /> "+val.tipo+" "+val.indice+" \
                                </a></li>"
                            $.each(mySystem.dataFiltros[i].acciones[j].metas, function(k, v){
                                // NO GUARDAMOS NADA DE METAS, SUPONDREMOS SIEMPRE QUE SELECCIONAN TODAS
                                $.each(mySystem.dataFiltros[i].acciones[j].metas[k].programas, function(l, key){
                                    dataMenuProgramas += " \
                                        <li title='"+key.desc+"'><a title='"+key.desc+"'> \
                                            <input type='checkbox' value='"+key.indice+"' name='"+key.indice+"' id='"+key.indice+"' /> "+key.tipo+" "+key.indice+" \
                                        </a></li>"
                                    $.each(mySystem.dataFiltros[i].acciones[j].metas[k].programas[l].proyectos, function(k, key2){
                                        dataMenuProyectos += " \
                                            <li title='"+key2.desc+"'><a title='"+key2.desc+"'> \
                                                <input type='checkbox' value='"+key2.indice+"' name='"+key2.indice+"' id='"+key2.indice+"' /> "+key2.tipo+" "+key2.indice+" \
                                            </a></li>"
                                    })
                                })
                            })
                        })
                    });
                    // Eliminando viejos elementos y agregando los nuevos
                    $(".dropdown .filtro li").not(".search").remove()
                    $("ul[isFilter='lineas'] .filtro").append(dataMenuLineas)
                    $("ul[isFilter='acciones'] .filtro").append(dataMenuAcciones).find("li").not(".search").hide()
                    $("ul[isFilter='programas'] .filtro").append(dataMenuProgramas).find("li").not(".search").hide()
                    $("ul[isFilter='proyectos'] .filtro").append(dataMenuProyectos).find("li").not(".search").hide()
                    mySystem.resetSystem()
                } else {
                    showDialog(
                        ':: Error ::', 
                        'Ha ocurrido un error: <br /><br />No existe un perfil para la cuenta <b>'+account+'</b><br />Contacte a la Unindad de Informática.', 
                        'icon-warning-sign', {
                            Ok: function() {
                                $(this).dialog('close')
                        } 
                    })
                }
            }
        })
    },

    loadData: function(){
        //...
    },

    validForm: function(){
        //...
    },

    saveForm: function(){
        //...
    },

    sendData: function(){
       //...
    },

    impReporte: function(){
        //...
    }
}
