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
 * SI SUPIERAS QUE AÚN DENTRO DE MI ALMA CONSERVO AQUEL CARIÑO QUE TUVE PARA TI
 * YO NO LE TENGO MIEDO A NADA, PERO TODAVÍA NO ME EXPLICO POR QUÉ TIEMBLO CADA VEZ QUE TE VEO
 * Internet con FACEBOOK: 172.50.201.101
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
var mySystem = {
    // VARIABLES
    windowSize    : TamVentana(),
    isChrome      : /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()),
    account       : 'todomundo@cobaes.edu.mx',     // Cualquier usuario puede ABC a los mismos datos
    userID        : $.trim($("#account").text()),
    continueAjax  : false,
    urlSam_load   : '/sam/Mapas/func_pide.ashx',
    urlLocal_load : 'data_v3.php',
    urlSam_save   : '/sam/Mapas/func_pide.ashx',
    urlImpPDF     : 'rptPide.php',
    dataFiltros   : {},
    activeFiltros : {},
    $dataRows     : undef,
    be4Data       : undef,

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

        $("thead .tableHeader td").tooltip({
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

        $('#tblIndicadores thead').waypoint(function() {
            if ($("#tblIndicadoresFloat").is(":visible")) {
                $("#tblIndicadoresFloat").hide()
            } else {
                $("#tblIndicadoresFloat").show()
            }
        }, { offset: 45 })

        //Crear los encabezados flotantes
        $( "#tblIndicadores thead" ).clone().prependTo( "#tblIndicadoresFloat thead" )

        $("#tblIndicadoresFloat thead td").tooltip({
            position: {
                my: "center top+10",
                at: "center bottom",
                using: function( position, feedback ) {
                    $( this ).css( position )
                    $( "<div>" )
                        .addClass( "arrow top" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this )
                }
            }
        })

        //$("#tblIndicadores").hide()
        //$("#tblIndicadores tbody tr").hide()
        $("thead td[title!='']").css('cursor','help')
        $("#btnSave").on("click", this.saveForm)
        $("#btnImp").on("click", this.impReporte)

        // Inicia todo lo relacionado con los Menus de Bootstrap
        this.btDropdownCustom()
    },

    resetSystem: function(){
        // OPERACION DE FILTROS [Lineas >> Acciones >> (*) Metas >> Programas >> Proyectos >> Indicadores]
        var $lineas = $("ul[isFilter='lineas'] li li"),
            $acciones = $("ul[isFilter='acciones'] li li"),
            $programas = $("ul[isFilter='programas'] li li"),
            $proyectos = $("ul[isFilter='proyectos'] li li"),
            $indicadores = $("#tblIndicadores tbody tr")

        this.$dataRows = $indicadores

        var threeIndices = function(){
            var indices = $indice.split("_")
                three = [],
                tmp = ''

            $.each(indices, function(i, value){
                tmp += value + "."
                three.push(tmp)
            })

            $.each(three, function(i, value){
                three[i] = value.substr(0,value.length-1)
            })

            return three
        }

        // REDIMENCIONAR MENU FLOTANTES
        $("#tblIndicadoresFloat thead td").each(function(i, value){
            var $this = $(this)
                $equivalente = $('#tblIndicadores thead').find("td[tipo='"+$this.attr("tipo")+"']")
            $this.width($equivalente.width())
        })

        $("#tblIndicadores .text").validCampo('1234567890.-');
        $("#tblIndicadores .date").datepicker({
            format : "dd/mm/yyyy"
        });

        $("#tblIndicadores textarea").focusin(function(e) {
            var that = $(this)
            txtPosition = that.position()
            tdHeight = that.closest('td').height();

            that.data("position", {top : txtPosition.top, left : txtPosition.left})
            
            that
                .css({
                    position: "absolute",
                    "z-index": 2
                })
                .animate({ 
                    width : 440, 
                    height: tdHeight, 
                    top: txtPosition.top, 
                    left: txtPosition.left-350
                }, 120)
        })
        $("#tblIndicadores textarea").focusout(function(e) {
            var that = $(this)

            that.animate({ 
                width : 90,
                height: 30,
                top: that.data("position").top, 
                left: that.data("position").left
            }, 80, 
                function(){
                    that.css({
                        position: "static",
                        "z-index": 2
                    })
                }
            )
        })

        //CALCULAR EL ALCANCE Y EL AVANCE
        $("#tblIndicadores .text").on("change", function(e){
            var $this = $(this),
                calif = parseFloat($this.val()),
                meta = parseFloat($this.attr("meta")),
                ponderacion = parseFloat($this.attr("ponderacion")),
                $tr = $(this).parents("tr"),
                trIndice = $tr.attr("id").substr(2),
                newAlcance = 0,
                newAvance = 0,
                $meta,
                totalAvance = 0

            var threeIndices = function(indice){
                var indices = indice.split("_")
                    three = [],
                    tmp = ''

                $.each(indices, function(i, value){
                    tmp += value + "_"
                    three.push(tmp)
                })

                $.each(three, function(i, value){
                    three[i] = value.substr(0,value.length-1)
                })

                return three
            }
            //console.log("calif: "+calif, "meta: "+meta, "ponderacion: "+ponderacion, "trIndice: "+trIndice)
            newAlcance = calif / meta
            newAlcance = (meta > 1 ? newAlcance*100 : newAlcance)
            newAlcance = roundf(newAlcance, 2)

            // EL AVANCE NO PUEDE SER MAYOR A LA PONDERACIÓN GLOBAL INDICADA.
            if (newAlcance > 100) {
                newAvance = roundf(ponderacion*100, 2);
            } else {
                newAvance = roundf((ponderacion*newAlcance)*1.0, 2)
            }

            if (!$.isNumeric(calif) || !$.isNumeric(newAlcance)){
                $tr.find("b[calculo='alcance']").text("...");
                $tr.find("b[calculo='avance']").text("...");
                return false
            }

            $tr.find("b[calculo='alcance']")
                .text(newAlcance + " %")
                .animate({ fontSize : '+=7' }, 100, 
                    function(){
                        $(this).animate({ fontSize : '-=7' }, 200)
                    }
                )
                .animate({ color : '#0080FF' }, 100,
                    function(){
                        $(this).animate({ color : '#333333' }, 1000)
                    }
                )
            $tr.find("b[calculo='avance']")
                .text(newAvance + " %")
                .animate({ fontSize : '+=7' }, 100, 
                    function(){
                        $(this).animate({ fontSize : '-=7' }, 200)
                    }
                )
                .animate({ color : '#0080FF' }, 100,
                    function(){
                        $(this).animate({ color : '#333333' }, 1000)
                    }
                )

            //CALCULAR LOS TOTALES DEL ALCANCE Y AVANCE
            $meta = $("tr[id^='tr"+threeIndices(trIndice)[2]+"'], tr[metaid^='tr"+threeIndices(trIndice)[2]+"']")
            //console.log("tr:",$tr, "trIndice: "+trIndice, "threeIndices: "+threeIndices(trIndice)[2])

            $meta.each(function(i, value){
                var $this = $(this)
                    sum = parseFloat($this.find("b[calculo='avance']").text().replace("%", "").trim())

                if ($.isNumeric(sum)) {
                    totalAvance += sum
                }
                //console.log($this, sum, totalAvance, $this.find("td").hasClass("total2"))
                if ($this.find("td").hasClass("total2")) {
                    //console.log($this, $this.find("td div[totalavance]"))
                    $this.find("td div[totalavance]")
                        .text(roundf(totalAvance, 2) +" %")
                        .animate({ fontSize : '+=7' }, 100, 
                            function(){
                                $(this).animate({ fontSize : '-=7' }, 200)
                            }
                        )
                        .animate({ color : '#0080FF' }, 100,
                            function(){
                                $(this).animate({ color : '#333333' }, 1000)
                            }
                        )
                    totalAvance = 0
                }
            })

            //$("input[id^='txt1_1_1']")
        })


        $(".dropdown li a").off("click")
        $(".dropdown li").off("hover")
        $(".dropdown input[type='text']").off("change")
        //$(".dropdown li a").remove()
        
        //ToolTip de las filtros
        $(".dropdown li a").tooltip({
            position: {
                my: "left+8 left",
                at: "right center",
                using: function( position, feedback ) {
                    $( this ).css( position )
                    $( "<div>" )
                        .addClass( "arrow left" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this )
                }
            }
        })
        
        // Para que se seleccione el texto dentro del campo text
        $(".dropdown input[type='text'], #tblIndicadores input").on("click", function(){
            this.select()
        })

        //Limpiando las cajas de texto
        $("ul[isFilter] .search input").val("").attr("disabled", true)

        // Controlando que todo el LI checkee el checkbox dentro de él
        /*
        $(".dropdown li a").not("input").on("click", function(e){
            var $chk = $(this).find("input[type='checkbox']")
            
            if ($chk.prop('checked')){
                $chk.prop('checked', false)
            } else {
                $chk.prop('checked', true)
            }
        })
        */

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
                $liElementsVisible = $(this).parents(".dropdown-menu").find("li").not(".search").has(":visible"),
                nameFilter = $(this).parents("ul[isFilter]").attr("isFilter")

            //console.log($liElements)

            // Es basura pero sirve como ejemplo
            var names = [ 
                { id: "1", value : "Jörn Zaefferer", email : "suprem.angel@gmail.com" }, 
                { id: "2", value : "Scott González", email : "scott@gmail.com" }, 
                { id: "3", value : "John Resig", email : "john@gmail.com" }, 
                { id: "4", value : "ActionScript", email : "actionscript@gmail.com" }
            ]


            // Desmarcando y ocultando todos los filtros delegados del actual
            switch(nameFilter){
                case "lineas":
                    $lineas.not(".search").find("input").prop("checked", false).parents("li li").show()
                    $acciones.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $programas.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break
                case "acciones":
                    $programas.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break
                case "programas":
                    $proyectos.not(".search").find("input").prop("checked", false).parents("li li").hide()
                    break
                case "proyectos":
                    //...
                    break
            }
            // Navegando y recoiendo todos los valores de cada opción checkbox
            $liElements
                .each(function(i, value){
                    //if ($(this).is(":visible")) {
                        var newData = {},
                            $this = $(this),
                            $input = $this.find("input")
                        
                        newData["id"] = $input.attr('id').toLowerCase()
                        newData["value"] = $this.text().trim().toLowerCase()
                        newData["value2"] = $input.val().toLowerCase()
                        newData["value3"] = $this.attr('title').toLowerCase()
                        
                        //console.log(i, value, $(this), newData)
                        dataSearch.push(newData)
                    //}
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
                //console.log(data)
                
                $liElements.find("input").prop('checked', false)
                $liElements.hide()
                //console.log($liElements)
                $.each(data, function(i, value){
                    $$liElementsVisible.find("input:checkbox[id^='"+value.id+"']").parents('li li').show()

                    //console.log($element)
                })
            }

            /**
             *  [Lleva a cabo las operaciones de filtro (tipo backend)]
             */
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" )
            var valor = ""
            response($.grep( dataSearch, function( value ) {
                valor = value.value || value.value2 || value.id
                //console.log(matcher, valor, normalize( valor ), normalize( value.value2 ), normalize( value.value3 ))
                return matcher.test( valor ) || 
                       matcher.test( normalize( valor ) ) ||
                       matcher.test( normalize( value.value2 ) ) ||
                       matcher.test( normalize( value.value3 ) )
            }))
        })

        $("ul[isFilter] li li input").on("click", function(e){
            e.preventDefault();
            e.stopPropagation();
        })

        $("ul[isFilter] li li").not(".search").on("click", 
            function(e){
                var $chk = $(this).find("input[type='checkbox']")
                
                if ($chk.prop('checked')){
                    $chk.prop('checked', false)
                } else {
                    $chk.prop('checked', true)
                }
                
                var $element = $(this),
                    $indice  = $element.find("input").val(),
                    $isCheck = $element.find("input").prop("checked"),
                    $filter = $element.parents("ul[isFilter]").attr("isFilter"),
                    $onChecks = $element.parents(".filtro").find("input:checkbox:checked"),
                    newHeight = 190,
                    $newIndicadores
                
                /**
                 * [threeIndices Devuelve un Array del arbol del filtro seleccionado]
                 * @return {Array} [Arbol del filtro seleccionado]
                 */
                var threeIndices = function(){
                    var indices = $indice.split(".")
                        three = [],
                        tmp = ''

                    $.each(indices, function(i, value){
                        tmp += value + "."
                        three.push(tmp)
                    })

                    $.each(three, function(i, value){
                        three[i] = value.substr(0,value.length-1)
                    })

                    return three
                }
                
                // ACTUALIZANDO LOS FILTROS
                $("#tblIndicadores").hide()
                //$("#tblIndicadores tbody tr").has(":visible").hide()
                $("#tblIndicadores tbody tr").hide()
                switch($filter){
                    case "lineas":
                        // MOSTRAR TODAS LOS INDICADORES DE LAS LINEAS MARCADAS
                        var $chkOK = $lineas.not(".search").find("input:checkbox:checked")

                        // MOSTRAR LOS ENCABEZADOS
                        if ($chkOK.length > 0){
                            $("#tblIndicadores").fadeIn('slow')
                        }
                        // MOSTRAR LOS INDICADORES (<TR>)
                        $chkOK.each(
                            function(i, value){
                                var indicadorID = value.value.replace(/\./gi,"_")

                                $newIndicadores = $("tr[id^='tr"+indicadorID+"'], tr[metaID^='tr"+indicadorID+"']")
                                $newIndicadores.fadeIn("slow")
                            }
                        )

                        // MOSTRAR TODOS LOS CHECKBOXES MARCADOS EN LOS FILTROS
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


                        $lineas.not(".search").find("input:checkbox:checked").each(function(icLinea, vLinea){
                            var iLinea = vLinea.value
                            
                            $acciones
                                .not(".search").find("input[id^='"+iLinea+"']").prop("checked", true)
                                .parents("li li").show()
                            $programas
                                .not(".search").find("input[id^='"+iLinea+"']").prop("checked", true)
                                .parents("li li").show()
                            $proyectos
                                .not(".search").find("input[id^='"+iLinea+"']").prop("checked", true)
                                .parents("li li").show()
                        })
                        
                        break
                    case "acciones":
                        var $chkOK = $acciones.not(".search").find("input:checkbox:checked")


                        // MOSTRAR LOS ENCABEZADOS
                        if ($chkOK.length > 0){
                            $("#tblIndicadores").fadeIn('slow')
                        }
                        // MOSTRAR LOS INDICADORES (<TR>)
                        $chkOK.each(
                            function(i, value){
                                var indicadorID = value.value.replace(/\./gi,"_")

                                $newIndicadores = $("tr[id^='tr"+indicadorID+"'], tr[metaID^='tr"+indicadorID+"']")
                                $newIndicadores.fadeIn("slow")
                            }
                        )

                        $programas
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")
                        $proyectos
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")


                        $acciones.not(".search").find("input:checkbox:checked").each(function(icAccion, iAccion){
                            var iAccion = iAccion.value
                            
                            $programas
                                .not(".search").find("input[id^='"+iAccion+"']").prop("checked", true)
                                .parents("li li").show()
                            $proyectos
                                .not(".search").find("input[id^='"+iAccion+"']").prop("checked", true)
                                .parents("li li").show()
                        })
                        
                        break
                    case "programas":
                        var $chkOK = $programas.not(".search").find("input:checkbox:checked")

                        // MOSTRAR LOS ENCABEZADOS
                        if ($chkOK.length > 0){
                            $("#tblIndicadores").fadeIn('slow')
                        }
                        // MOSTRAR LOS INDICADORES (<TR>)
                        $chkOK.each(
                            function(i, value){
                                var indicadorID = value.value.replace(/\./gi,"_"),
                                    metaID = value.value.substr(0, value.value.length-2).replace(/\./gi,"_")

                                $newIndicadores = $("tr[id^='tr"+metaID+"'][tipo='meta'], tr[metaID^='tr"+metaID+"'], tr[id^='tr"+indicadorID+"']")
                                $newIndicadores.fadeIn("slow")

                            }
                        )

                        $proyectos
                            .not(".search").find("input").prop("checked", false).parents("li li").hide()
                            .parents("ul ul").find(".search input").val("")

                        $programas.not(".search").find("input:checkbox:checked").each(function(icPrograma, iPrograma){
                            var iPrograma = iPrograma.value
                            
                            $proyectos
                                .not(".search").find("input[id^='"+iPrograma+"']").prop("checked", true)
                                .parents("li li").show()
                        })
                        
                        break
                    case "proyectos":
                        var $chkOK = $proyectos.not(".search").find("input:checkbox:checked")


                        // MOSTRAR LOS ENCABEZADOS
                        if ($chkOK.length > 0){
                            $("#tblIndicadores").fadeIn('slow')
                        }
                        // MOSTRAR LOS INDICADORES (<TR>)
                        $chkOK.each(
                            function(i, value){
                                var indicadorID = value.value.replace(/\./gi,"_"),
                                    metaID = value.value.substr(0, value.value.length-4).replace(/\./gi,"_")

                                $newIndicadores = $("tr[id^='tr"+metaID+"'][tipo='meta'], tr[metaID^='tr"+metaID+"'], tr[id^='tr"+indicadorID+"']")
                                $newIndicadores.fadeIn("slow")
                            }
                        )
                        break
                }

                /**
                 * [REDIMENCIONAR Y ADAPTAR EL MENU FLOTANTE]
                 */
                setTimeout(
                    function(){
                        $("#tblIndicadoresFloat thead td").each(function(i, value){
                            var $this = $(this)
                                $equivalente = $('#tblIndicadores thead').find("td[tipo='"+$this.attr("tipo")+"']")
                            $this.width($equivalente.width())
                        })
                }, 900)

                // REALIZAR LOS CALCULOS DE LAS METAS Y PROYECTOS
                var totalPonderacion = 0,
                    totalAvance = 0
                $indicadores.has(":visible").each(function(i, value){
                //$newIndicadores.each(function(i, value){
                    var $this = $(this)
                        sum = parseFloat($this.find("td span[tipo='ponderacion']").text().replace("%", "").trim()),
                        sumAlcance = parseFloat($this.find("td b[tipo='avance']").text().replace("%", "").trim())

                    if ($.isNumeric(sum)) {
                        totalPonderacion += sum
                    }

                    if ($.isNumeric(sumAlcance)) {
                        totalAvance += sumAlcance
                    }
                    
                    //console.log(sumAlcance, totalAvance, $this.find("td b[tipo='avance']"), $this.find("td").hasClass("total2"))
                    if ($this.find("td").hasClass("total1")) {
                        $this.find("td div[totalPonderacion]").text(totalPonderacion +" %")
                        totalPonderacion = 0
                    }

                    if ($this.find("td").hasClass("total2")) {
                        $this.find("td div[totalAvance]").text(totalAvance +" %")
                        totalAvance = 0
                    }

                    //console.log($this.find("td span[tipo='ponderacion']"), totalPonderacion)
                })
            }
        )

        $("#btnLogout").on("click", mySystem.logout)
        mySystem.be4Data = mySystem.chargeData()
    },

    btDropdownCustom: function(){
        $.ajax({
            data: { 
                'action'  : 'load',
                'cuenta'  : mySystem.account
            },
            //url : this.urlLocal_load,
            url : this.urlSam_load,
            success: function(data) {
                var dataMenuLineas = '',
                    dataMenuAcciones = '',
                    dataMenuMetas = '',
                    dataMenuProgramas = '',
                    dataMenuProyectos = '',
                    dataIndicadores = ''
                //console.log(data)

                if (!data.anyErr){
                    mySystem.dataFiltros = data["lineas"]

                    $.each(mySystem.dataFiltros, function(i, value){
                        //console.log(i, this)
                        dataMenuLineas += " \
                        <li title='"+value.desc+"'><a title='"+value.desc+"'> \
                            <input type='checkbox' value='"+value.indice+"' checked='checked' name='"+value.indice+"' id='"+value.indice+"' /> "+value.tipo+" "+value.indice+" \
                        </a></li>"
                        $.each(mySystem.dataFiltros[i].acciones, function(j, val){
                            dataMenuAcciones += " \
                                <li title='"+val.desc+"'><a title='"+val.desc+"'> \
                                    <input type='checkbox' value='"+val.indice+"' checked='checked' name='"+val.indice+"' id='"+val.indice+"' /> "+val.tipo+" "+val.indice+" \
                                </a></li>"
                            $.each(mySystem.dataFiltros[i].acciones[j].metas, function(k, v){
                                var metaPonderacion = 0,
                                    metaAvance = 0

                                dataIndicadores += " \
                                <tr id='tr"+v.indice.replace(/\./gi,"_")+"' class='subHeader01' tipo='meta'><td colspan='9'> \
                                    <b>"+ v.indice + " - " + v.desc + " </b>\
                                </td></tr>"

                                $.each(mySystem.dataFiltros[i].acciones[j].metas[k].programas, function(l, key){
                                    dataMenuProgramas += " \
                                        <li title='"+key.desc+"'><a title='"+key.desc+"'> \
                                            <input type='checkbox' value='"+key.indice+"' checked='checked' name='"+key.indice+"' id='"+key.indice+"' /> "+key.tipo+" "+key.indice+" \
                                        </a></li>"
                                    $.each(mySystem.dataFiltros[i].acciones[j].metas[k].programas[l].proyectos, function(m, key2){
                                        dataMenuProyectos += " \
                                            <li title='"+key2.desc+"'><a title='"+key2.desc+"'> \
                                                <input type='checkbox' value='"+key2.indice+"' checked='checked' name='"+key2.indice+"' id='"+key2.indice+"' /> "+key2.tipo+" "+key2.indice+" \
                                            </a></li>"

                                        dataIndicadores += " \
                                        <tr id='tr"+key2.indice.replace(/\./gi,"_")+"' class='subHeader02' tipo='proyecto'><td colspan='9'> \
                                            <b>" + key2.desc + " </b> \
                                        </td></tr>"

                                        $.each(mySystem.dataFiltros[i].acciones[j].metas[k].programas[l].proyectos[m].indicadores, function(n, key3){
                                            var meta = parseFloat(key3.Meta),
                                                ponderacion = parseFloat(key3.ponderación),
                                                indice = key3.indice.replace(/\./gi,"_"),
                                                metaOnly = meta,
                                                ponderacionOnly = ponderacion,
                                                newAlcance = (key3.alcance=="" ? "..." : key3.alcance + " %"),
                                                newAvance = (key3.avance=="" ? "..." : key3.avance + " %"),
                                                newFecha = (key3.fecha=="01/01/1900" ? "" : key3.fecha)

                                            metaPonderacion += ponderacion
                                            metaAvance += (key3.avance == "" ? 0 : parseFloat(key3.avance))

                                            meta = (meta > 1 ? meta : roundf(meta * 100, 2) + "%")
                                            ponderacion = roundf(ponderacion * 100 , 2) + "%"
                                            
                                            dataIndicadores += " \
                                            <tr id='tr"+indice+"'> \
                                                <td><span class='tdIndicadores'>"+key3.desc+"</span></td> \
                                                <td><input id='txt"+indice+"'' ponderacion='"+ponderacionOnly+"' meta='"+metaOnly+"' class='input-block-level text' maxlength='6' type='text' calif='0' value='"+key3.calif+"' /></td> \
                                                <td>"+meta+"</td> \
                                                <td align='center'><b calculo='alcance'>"+newAlcance+"</b></td> \
                                                <td> \
                <div class='input-append date' data-date='"+newFecha+"' data-date-format='dd/mm/yyyy'> \
                <input class='input-small datepicker' readonly type='text' placeholder='DD/MM/AAAA' value='"+newFecha+"'> \
                <span class='add-on'><i class='icon-calendar'></i></span> \
                </div></td> \
                                                    <input id='date"+indice+"'' class='input-block-level' maxlength='6' type='text' value='"+key3.calif+"' /></td> \
                                                <td><span tipo='ponderacion'>"+ponderacion+"</span></td> \
                                                <td align='center'><b calculo='avance' tipo='avance'>"+newAvance+"</b></td> \
                                                <td ><textarea id='txtObs"+indice+"'' class='input-block-level' maxlength='254' rows=1>"+key3.observacion+"</textarea> \
                                                </td> \
                                            </tr>"
                                        })
                                    })
                                })
                                // TOTALES META
                                metaPonderacion = roundf(metaPonderacion*100, 2)
                                metaAvance = roundf(metaAvance, 2)
                                dataIndicadores += " \
                                <tr metaID='tr"+v.indice.replace(/\./gi,"_")+"' class='subTotal01'> \
                                    <td align='right' class='leftTotal' colspan='5'><b>TOTALES: </b></td> \
                                    <td class='total1'><div totalPonderacion=''>"+metaPonderacion+" %</div></td> \
                                    <td class='total2' colspan='1'><div totalAvance=''>"+metaAvance+" %</div></td> \
                                    <td class='rightTotal' ></td> \
                                </tr>"
                            })
                        })
                    })
                    // Eliminando viejos elementos y agregando los nuevos
                    $(".dropdown .filtro li").not(".search").remove()
                    $("ul[isFilter='lineas'] .filtro").append(dataMenuLineas)
                    $("#tblIndicadores tbody").append(dataIndicadores)
                    // AGREGAMOS LOS FILTROS Y LOS OCULTAMOS...
                    $("ul[isFilter='acciones'] .filtro").append(dataMenuAcciones).find("li").not(".search")
                    $("ul[isFilter='programas'] .filtro").append(dataMenuProgramas).find("li").not(".search")
                    $("ul[isFilter='proyectos'] .filtro").append(dataMenuProyectos).find("li").not(".search")
                    //$("#tblIndicadores").hide()
                    //$("#tblIndicadores tbody tr").hide()

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
        this.btDropdownCustom();
    },

    chargeData: function(){
        var $dataRows = mySystem.$dataRows.not(".subHeader01, .subHeader02, .subTotal01"),
            data = [],
            dataRow = {},
            numData2Send = 12

        $dataRows.each(function(i, value){
            var $this = $(this),
                dataRow = {},
                dataFecha = undef,
                indicadorID = $this.attr("id").substr(2)

            dataRow["indicadorID"] = indicadorID
            dataRow["calif"]       = $this.find("#txt"+indicadorID).val()
            dataRow["alcance"]     = $this.find("b[calculo='alcance']").text().replace("%", "").trim()
            dataRow["fecha"]       = $this.find(".date input").val()
            dataRow["avance"]      = $this.find("b[calculo='avance']").text().replace("%", "").trim()
            dataRow["observacion"] = $this.find("#txtObs"+indicadorID).val()

            //dataFecha              = (dataRow["fecha"] == "" ? "01/01/1900" : dataRow["fecha"])
            //dataFecha              = dataFecha.split("/")
            //dataRow["fecha"]       = dataFecha[1]+"/"+dataFecha[0]+"/"+dataFecha[2]
            dataRow["fecha"]       = (dataRow["fecha"] == "" ? "01/01/1900" : dataRow["fecha"])
            dataRow["calif"]       = (dataRow["calif"] == "" ? "" : dataRow["calif"])
            dataRow["alcance"]     = (dataRow["alcance"] == "..." ? "" : dataRow["alcance"])
            dataRow["avance"]      = (dataRow["avance"] == "..." ? "" : dataRow["avance"])

            /**
             * RESTRINGE LOS REGISTROS ENVIADOS A 6
             *
            if (numData2Send > 0) {
                data.push(dataRow)
                numData2Send--
            }
            */
            data.push(dataRow)
        })

        return {
            "data"     : data,
            "jsonData" : JSON.stringify(data)
        }
    },

    validForm: function(){
        //...
    },

    /**
     * Guarda la Información del formulario
     * @return {[type]} [description]
     */
    saveForm: function(){
        var data = mySystem.chargeData()
        
        if (data.jsonData === mySystem.be4Data.jsonData){
            showDialog(
                ':: Aviso ::', 
                'No se han detectado cambios para guardar', 
                'icon-warning-sign', {
                    Ok: function() {
                        $(this).dialog('close');
                } 
            });
            return false;
        }

        //console.log(data)
        $.ajax({
            data: {
                'data'       : data.jsonData,
                'cuenta'     : mySystem.account,
                'action'     : 'saveData'
            },
            url : mySystem.urlSam_save,
            success: function(data) {
                //console.log("data:", data);
                if (!data.anyErr){
                    mySystem.be4Data = mySystem.chargeData()
                    showDialog(
                        ':: Operación con Exito ::', 
                        'Se han guardado los datos satisfactoriamente', 
                        'icon-check-sign', {
                            "Aceptar": function() {
                               //$(location).attr('href', "menu.php");
                               $(this).dialog('close');
                            }
                        }
                    );
                } else {
                    showDialog(
                        ':: Error ::', 
                        'Ha ocurrido un error: <br /><br />'+data.descErr, 
                        'icon-warning-sign', {
                            Ok: function() {
                                $(this).dialog('close');
                        } 
                    });
                }
            }
        })
    },

    logout: function(e){
       var urlLogout = "https://accounts.google.com/Logout"
           urlLogout2 = "https://accounts.google.com/Logout?hl=es&continue=https://www.google.com.mx/#q=cobaes"
       //ifLogout.location = urlLogout
       //$('#ifLogout').attr('src', urlLogout)
       //$('#ifLogout').reload()
       console.log(location, 'logout.php?url='+urlLogout2)
       $(location).attr('href', 'logout.php?url='+urlLogout2);
    },

    impReporte: function(){
        $.ajax({
            data: {
                'data'       : "all",
                'account'    : mySystem.userID,
            },
            url : mySystem.urlImpPDF,
            success: function(data) {
                //console.log("data:", data);
                if (!data.anyErr){
                    //console.log(location, data.patchPDF)        // Misma Ventana
                    window.open(data.patchPDF, "_blank");       // Nueva Ventana
                } else {
                    showDialog(
                        ':: Error ::', 
                        'Ha ocurrido un error: <br /><br />'+data.descErr, 
                        'icon-warning-sign', {
                            Ok: function() {
                                $(this).dialog('close');
                        } 
                    });
                }
            }
        })
    }
}
