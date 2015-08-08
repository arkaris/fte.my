/* - - - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - C O N F I G - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
function fteGetConfig(){
  config = {
    // Id of div element for FTE
    containerId: "FTEContainer",
    //request data addres
    serviceUrl: "FTEServerSide.php",
    // Default language
    defaultLang: 'ru',
		// Language variable. Be careful with special chars!
		langKey: '$lang'
  };
  
  return config;
}

document.addEventListener("DOMContentLoaded", function(){fte = new FTE(fteGetConfig());});

/* - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - M A I N - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - -
 */
function FTE(config) {
  var self = this;
  /* - - - - - - - - - - - - - - - - - - - - - - - - -
   * - - - - - - - - - - M O D E L - - - - - - - - - -
   * - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  this.model = {};
  this.model.template = {};
	this.model.variables = {};
	this.model.templateList = {};
	this.model.languageList = {};
  
  // - - - - - - - - - - A J A X - - - - - - - - - -
  function ajaxRequest(method, url, data, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (~~(xhr.status/100) == 2) {
				if (successCallback) successCallback(xhr);
      } else {
				if (errorCallback) errorCallback(xhr)
				else alert('AJAX error: '+xhr.status);
      }
    };
    
    var body = JSON.stringify(data) || '';
    xhr.send(body);
  }
  
  // - - - - - - - - - - G E T T E R S - - - - - - - - - -
  
  function getTemplateList() {
    ajaxRequest('GET', this.config.serviceUrl, null, 
      function(response) {
        var responseText = JSON.parse(response.responseText);
        self.model.templateList = responseText.data;
        self.shell.dispatchEvent(templateListSync);
      },
      function(response) {
        alert("Can't get template list. Response status: "+xhr.status);
      });
  }
  
  function getTemplate(template) {
    ajaxRequest('GET', this.config.serviceUrl+"?template="+template, null, 
      function(response) {
        var responseText = JSON.parse(response.responseText);
        self.model.variables = responseText.data.variables;
				var _template = responseText.data.template;
				_template = parseLangIn(_template);
				self.model.template = parseVarIn(_template, self.model.variables, self.view.variableSpan);
        self.templateList.dispatchEvent(templateChange);
      },
      function(response) {
        alert("Can't get template. Response status: "+xhr.status);
      });
  }
	
	// - - - - - - - - - - S E T T E R S - - - - - - - - - -
	
	function patchTemplate(template, data) {
		ajaxRequest('PATCH', this.config.serviceUrl+"?template="+template, data,
		function(response) {
			alert('Success');
		},
		function(response) {
			alert("Can't update template. Response status: "+xhr.status);
		});
	}
  
  /* - - - - - - - - - - - - - - - - - - - - - - - -
   * - - - - - - - - - - V I E W - - - - - - - - - -
   * - - - - - - - - - - - - - - - - - - - - - - - -
   */
  this.view = {};
  this.menuField = {};
  this.templateList = {};
  this.languageList = {};
  this.variableField = {};
	this.editField = {};
  this.templateField = {};
  
  this.view.Shell = function() {
    var fragment = document.createDocumentFragment();
    
    var menuField = document.createElement('div');
    menuField.className = 'menuField menuWidth';
    fragment.appendChild(menuField);
    self.menuField = menuField;
    
    var templateListField = document.createElement('div');
    templateListField.className = "templateListField";
    var templateList = document.createElement('select');
    templateList.className = "templateList";
    var languageList = document.createElement('select');
    languageList.className = "languageList";
    templateListField.appendChild(templateList);
    templateListField.appendChild(languageList);
    menuField.appendChild(templateListField);
    self.templateList = templateList;
    self.languageList = languageList;
    
    var variableField = document.createElement('div');
    variableField.className = "variableField";
    menuField.appendChild(variableField);
    self.variableField = variableField;
		
		var editField = document.createElement('div');
		editField.className = "editField";
		menuField.appendChild(editField);
		self.editField = editField;
    
    var templateField = document.createElement('div');
    templateField.className = 'templateField';
    templateField.contentEditable = true;
    templateField.innerHTML = '<p><br></p>';
    fragment.appendChild(templateField);
    self.templateField = templateField;

    return fragment;
  };
  
  this.view.MenuButton = function (name, caption, styleName) {
    var fragment = document.createDocumentFragment();
    
    var menuButton = document.createElement('button');
    menuButton.className = styleName ? 'button ' + styleName : 'button';
    menuButton.innerText = caption;
		menuButton.dataset.caption = caption;
    menuButton.dataset.buttonName = name;
    fragment.appendChild(menuButton);
    
    return fragment;
  };
	
	this.view.variableSpan = function(name, caption) {
		return '<span class="variable" data-variable-name="'+name+'" contentEditable="false">'+caption+'</span>';
	};
  
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * - - - - - - - - - - C O N T R O L L E R - - - - - - - - - -
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  this.hangDownEventListeners = function() {
  	
    this.shell.addEventListener("templateListSync", function(e) {
	    self.templateList.innerHTML = '';
	    self.languageList.innerHTML = '';
			self.variableField.innerHTML = '';
	    self.templateField.innerHTML = '';
			self.editField.innerHTML = '';
//    self.languageList.addClass('hide');
      for (var key in self.model.templateList) {
        var opt = new Option(self.model.templateList[key], key);
        self.templateList.appendChild(opt);
      }
      self.templateList.selectedIndex = -1;
    });
    
    this.templateList.addEventListener("change", function(e) {
      getTemplate(self.templateList.value);//fires templateChange as success callback
    });
    this.templateList.addEventListener("templateChange", function(e) {
			self.languageList.innerHTML = '';
			self.languageList.dataset.current = '';
			self.variableField.innerHTML = '';
			self.templateField.innerHTML = '';
			self.editField.innerHTML = '';
			
      for (var key in self.model.template) {
      	var opt = new Option(key);
      	self.languageList.appendChild(opt);
      }
      self.languageList.selectedIndex = self.languageList.length-1;
      self.languageList.dispatchEvent(languageChange);
    });
    
    this.languageList.addEventListener("change", function(e) {
    	self.languageList.dispatchEvent(languageChange);
    });
    this.languageList.addEventListener("languageChange", function(e) {
			if ( self.languageList.dataset.current )
				self.model.template[self.languageList.dataset.current] = parseLinesOut(self.templateField.innerHTML);
			self.languageList.dataset.current = self.languageList.value;
			
			self.variableField.innerHTML = '';
			self.templateField.innerHTML = '';
			self.editField.innerHTML = '';
    	
    	for (key in self.model.variables) {
				var variable = self.model.variables[key];
				var lang = self.languageList.value;
    		self.variableField.appendChild( new self.view.MenuButton( key, self.model.variables[key][lang], 'variable') );
    	};
			
			self.templateField.innerHTML = parseLinesIn(self.model.template[self.languageList.value]);
			
			self.editField.appendChild( new self.view.MenuButton('save', lang=='ru'?'Сохранить':'Save', 'edit') );
    });
		
		this.menuField.addEventListener("click", function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement;
			while (target != this) {
				if (target.dataset.buttonName && hasClass(target, 'variable')) {//add variable button
					addVariable(target.dataset.buttonName, target.dataset.caption);
					break;
				}
				
				if ( target.dataset.buttonName=='save' && hasClass(target, 'edit') && self.languageList.value ) {
					self.model.template[self.languageList.value] = parseLinesOut(self.templateField.innerHTML);
					var data = parseVarOut(self.model.template);
					data = parseLangOut(data);
					patchTemplate(self.templateList.value, data);
					break;
				}
				target = target.parentNode;
			}
		});
		
		this.templateField.addEventListener("click", function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement;
			while (target != this) {
				if (hasClass(target, 'variable')) {//variable
					pasteCaretAfter(target);
					break;
				}
				target = target.parentNode;
			}
		});
  };
  
  // - - - - - - - - - - E V E N T S - - - - - - - - - -
  var templateListSync = new CustomEvent("templateListSync", {bubbles: true});
  var templateChange = new CustomEvent("templateChange", {bubbles: true});// to fire callback after async request
  var languageChange = new CustomEvent("languageChange", {bubbles: true});// cant fire default "change" event when set value by hand
  
  // - - - - - - - - - - U T I L - - - - - - - - - -
	// Parse
  function parseLangIn(_template) {
    var strArr = _template.split('\r\n');
		var template = {};
    var str;
    var result;
    var lang;
    var i = 0;
		var langKey = this.config.langKey.replace(/\$/g, '\\$');
		
    // Search {if}
    for (i; i < strArr.length; i++) {
    	result = strArr[i].match( new RegExp('\\{\\s*if\\s+'+langKey+'\\s*==\\s*(\\w+)\\}', 'i') );
    	if (result) {
    		lang = result[1];
    		template[lang] = [];
    		result = strArr[i].match( new RegExp('\\{\\s*if\\s+'+langKey+'\\s*==\\s*\\w+\\}(.+)$', 'i') );
    		if (result)
    			template[lang].push(result[1]);
    		i++;
    		break;
    	}
    }
    // Search {else if}, {else}, {/if}
    for (i; i < strArr.length; i++) {
    	str = strArr[i];
    	// Search {else if}
    	result = str.search(new RegExp('\\{\\s*else\\s*if\\s*'+langKey+'\\s*==\\s*\\w+\\}', 'i') );
    	if (~result) {
    		result = str.match( new RegExp('^(.+)\\{\\s*else\\s*if\\s*'+langKey+'\\s*==\\s*\\w+\\}', 'i') );
    		if ( result && lang ) template[lang].push( result[1] );
    		result = strArr[i].match( new RegExp('\\{\\s*else\\s*if\\s*'+langKey+'\\s*==\\s*(\\w+)\\}','i') );
    		lang = result[1];
    		template[lang] = [];
    		result = str.match( new RegExp('\\{\\s*else\\s*if\\s*'+langKey+'\\s*==\\s*\\w+\\}(.+)$','i') );
    		if (!result) continue;
    		str = result[1];
    	}
    	// Search {else}
    	result = str.search(/\{\s*else\s*\}/i);
    	if (~result) {
    		result = str.match(/^(.+)\{\s*else\s*\}/i);
    		if ( result && lang ) template[lang].push( result[1] );
    		lang = self.config.defaultLang;
    		template[lang] = [];
    		result = str.match(/\{\s*else\s*\}(.+)$/i);
    		if (!result) continue;
    		str = result[1];
    	}
    	// Search {/if}
    	result = str.search(/\{\s*\/\s*if\s*\}/i);
    	if (~result) {
    		result = str.match(/^(.+)\{\s*\/\s*if\s*\}/i);
    		if ( result && lang ) template[lang].push( result[1] );
    		break;
    	}
    	if (lang) template[lang].push(str);
    }
		
		if (!lang) template[self.config.defaultLang] = [];
		
		return template;
  };
	
	function parseLangOut(template) {
		var str = "";
		for (lang in template) {
			if (lang == self.config.defaultLang) continue;
			
			if (!str) {
				str = '{if ' +this.config.langKey+ '==' +lang+ '}\r\n';
			} else {
				str += '{elseif ' +this.config.langKey+ '==' +lang+ '}\r\n';
			}
			str += template[lang].join('\r\n');
		}
		if (template[self.config.defaultLang])
			str += '{else}\r\n' + template[self.config.defaultLang].join('\r\n');
		str += '{/if}';
		
		return str;
	}
	
	function parseVarIn(template, variables, fragment) {
		for (var lang in template) {// For every template by lang
			for (var i = 0; i < template[lang].length; i++) {// For every line in template
				for (var variable in variables) {// For every variable[lang]
					template[lang][i] = template[lang][i].replace( 
						variable, fragment(variable, self.model.variables[variable][lang]) );
				}
			}
		}
		
		return template;
	}
	
	function parseVarOut(template) {
		var node = document.createElement('div');
		for (var lang in template) {												// for every template by lang
			for (var l = 0; l < template[lang].length; l++) {	// for every line
				node.innerHTML = template[lang][l];
				var variables = node.querySelectorAll('.variable');
				for (var i = 0; i < variables.length; i++) {		// for every variable (span)
					variables[i].parentNode.replaceChild( document.createTextNode(variables[i].getAttribute('data-variable-name')), variables[i] );
				}
				template[lang][l] = node.innerHTML;
			}
		}
		
		return template;
	}
	
	function parseLinesIn(template) {
		template = template.join('<br>') || '<br>';
		template = '<p>' + template + '</p>';
		return template;
	}
	
	function parseLinesOut(template) {
		var result = template.match(/^\<p\>(.*)\<\/p\>$/);								// remove first <p> and last </p>
		template = result ? result[1] : template;													// if they exist
		template = template.split('</p><p>').join('<br>').split('<br>');	// </p><p> == <br> => new line
		
		return template;
	}
	
	// Caret functions
	function addVariable(name, caption) {
		if (!self.templateField.contentEditable/*заменить проверкой места курсора*/) {
			return false;
		} else {
      var varCode = self.view.variableSpan(name, caption);
      pasteHtmlAtCaret(varCode);
    }
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
        if (lastNode) pasteCaretAfter(lastNode);
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
      range = sel.getRangeAt(0).cloneRange();
      range.setStartAfter(el);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
	
	//Class functions
	function hasClass(obj, cls) {
		var classes = obj.className.split(' ');
		return classes.filter(function(el){return el==cls}).length;
	}
  
  // - - - - - - - - - - I N I T - - - - - - - - - -
  this.config = config;
  
  this.shell = document.getElementById( config.containerId ).
    appendChild(document.createElement("div"));
  this.shell.className = 'fte-container';
  this.shell.appendChild( new this.view.Shell() );
  
  this.hangDownEventListeners();
  
  getTemplateList();
}