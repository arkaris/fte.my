//- - - - - - - - - - P A R A M E T E R S - - - - - - - - - -

function defaultFTEParam(){
  //return param;
}

//- - - - - - - - - - M A I N - - - - - - - - - -

function FTE(containerId, param) {
  //- - - - - - - - - - I N I T I A L I S E - - - - - - - - - -
  if (!param) param = defaultFTEParam();
  var container, menuField, textField, templateList;
  var variables;
  drowMainField();
  getTemplateList();
  
  //- - - - - - - - - - M O D E L - - - - - - - - - -
  
  function addVariable(name, caption) {
    if (!textField.contentEditable/*заменить проверкой места курсора*/) {return false;} else {
      var varCode = '<span class="variable" data-variable-name="'+name+'" contentEditable="false">'+caption+'</span>';
      pasteHtmlAtCaret(varCode);
    }
  }
  
  function removeVariable(el) {
    el.parentNode.removeChild(el);
  }
  
  function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        
        // Range.createContextualFragment() would be useful here but is
        // non-standard and not supported in all browsers (IE9, for one)
        var el = document.createElement("div");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ( (node = el.firstChild) ) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        pasteCaretAfter(lastNode);
      }
    } else if (document.selection && document.selection.type != "Control") {
      // IE < 9
      document.selection.createRange().pasteHTML(html);
    }
  }
  
  function pasteCaretAfter(el) {
    var sel, range;
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range = range.cloneRange();
      range.setStartAfter(el);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  
  function ajaxRequest(act, target, data) {
    var body = 'act='+act;
    if (target) {
      body+= '&target='+target;
    }
    if (data) {
      body+= '&data='+JSON.stringify(data);
    } 
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '_FTEServerSide.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      var response = JSON.parse(this.responseText);
      ajaxCallback(response);
    };
    xhr.send(body);
  }
  
  function getTemplateList() {
    ajaxRequest('getList');
  }
  
  function fillTemplateList(data) {
    templateList.innerHTML='';
    for (var key in data) {
      var tmp = new Option(data[key], key);
      templateList.appendChild(tmp);
    }
    templateList.selectedIndex = -1;
  }
  
  function getTemplate(name) {
    ajaxRequest('get', name, "");
  }
  
  function fillVariables(data) {
    variables = data;
    for (var key in data) {
      addVarButton(key, data[key]);
    }
    console.log(data);
  }
  
  //- - - - - - - - - - V I E W - - - - - - - - - -
  
  function drowMainField() {
    container = document.getElementById(containerId);
    container.classList.add('fteContainer');
    //область для кнопок редактирования
    menuField = document.createElement('div');
    menuField.className = 'menuField';
    container.appendChild(menuField);
    //область для ввода и редактирования текста
    textField = document.createElement('div');
    textField.className = 'textField';
    textField.contentEditable = true;
    container.appendChild(textField);
    textField.innerHTML = '<p><br></p>';
    //список доступных шаблонов
    templateList = document.createElement('select');
    menuField.appendChild(templateList);
  }
  
  function addVarButton (name, caption) {
    var tmp = document.createElement('button');
    tmp.className = 'menuButton variable';
    tmp.innerText = caption;
    tmp.dataset.variableName = name;
    tmp.dataset.caption = caption;
    menuField.appendChild(tmp);
  }
  
  function clearVarButtons() {
    var tmp = menuField.querySelectorAll('.variable');
    if (tmp.length == 0) return;
    for (var i=0; i< tmp.length; i++) {
      tmp[i].parentNode.removeChild(tmp[i]);
    }
  }
  
  //- - - - - - - - - - C O N T R O L L E R - - - - - - - - - -
  
  //клик по меню
  menuField.onclick = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    while (target != this) {
      if (target.dataset.variableName) {//кнопка добавления переменной
        addVariable(target.dataset.variableName, target.dataset.caption);
        break;
      }
      target = target.parentNode;
    }
  };
  //клик по тексту
  textField.onclick = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    while (target != this) {
      if (target.dataset.variableName) {//переменная
        pasteCaretAfter(target);
        break;
      }
      target = target.parentNode;
    }
  };
  //правый клик по тексту
  textField.oncontextmenu = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    while (target != this) {
      if (target.dataset.variableName) {//переменная
        callContextMenu(target);
        return false;
      }
      target = target.parentNode;
    }
  };
  //смена шаблона
  templateList.onchange = function(e) {
    textField.innerText = '';
    clearVarButtons();
    getTemplate(templateList.value);
  };
  
  function callContextMenu(el) {
    var del = confirm('Красивое контекстное меню.\n Удалить?');
    if (del) removeVariable(el);
    return false;
  }
  
  function ajaxCallback(request) {
    if (request.code == "templateList") {
      fillTemplateList(request.data);
      //console.log(request);
    } else if (request.code == "template") {
      fillVariables(request.data.variables);
      textField.innerText = request.data.template;
    } else {
      textField.innerText = request.message;
      console.log(request);
    }
  }
  
  /*
  //пример замены генератора кода
  $('div[contenteditable]').keydown(function(e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false, '<br><br>');
      // prevent the default behaviour of return key pressed
      return false;
    }
  });
  */
 
}

//- - - - - - - - - - C O M M O N - - - - - - - - - -

if (!window._ua) {
  var _ua = navigator.userAgent.toLowerCase();
}
if (!browser) var browser = {
  version: (_ua.match( /.+(?:me|ox|on|rv|it|era|opr|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: (/opera/i.test(_ua) || /opr/i.test(_ua)),
  msie: (/msie/i.test(_ua) && !/opera/i.test(_ua) || /trident\//i.test(_ua)),
  msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
  msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
  msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
  msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
  mozilla: /firefox/i.test(_ua),
  chrome: /chrome/i.test(_ua),
  safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
  iphone: /iphone/i.test(_ua),
  ipod: /ipod/i.test(_ua),
  iphone4: /iphone.*OS 4/i.test(_ua),
  ipod4: /ipod.*OS 4/i.test(_ua),
  ipad: /ipad/i.test(_ua),
  android: /android/i.test(_ua),
  bada: /bada/i.test(_ua),
  mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(_ua),
  msie_mobile: /iemobile/i.test(_ua),
  safari_mobile: /iphone|ipod|ipad/i.test(_ua),
  opera_mobile: /opera mini|opera mobi/i.test(_ua),
  opera_mini: /opera mini/i.test(_ua),
  mac: /mac/i.test(_ua),
  search_bot: /(yandex|google|stackrambler|aport|slurp|msnbot|bingbot|twitterbot|ia_archiver|facebookexternalhit)/i.test(_ua)
};