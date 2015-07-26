/* - - - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - C O N F I G - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
function fteGetConfig(){
  config = {
    //id of div element for FTE
    containerId: "FTEContainer",
    //request data addres
    serviceUrl: "FTEServerSide.php"
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
  
  // - - - - - - - - - - A J A X - - - - - - - - - -
  function ajaxRequest(method, url, data, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (~~(xhr.status/100) == 2) {
      	console.log('success:');
        console.log(JSON.parse(xhr.responseText));
        successCallback ? successCallback(xhr) : console.log(xhr);
      } else {
      	console.log('error:');
        console.log(JSON.parse(xhr.responseText));
        errorCallback ? errorCallback(xhr) : console.log(xhr);
      }
    };
    
    var body = JSON.stringify(data) || '';
    xhr.send(body);
    console.log('from: ' + url);
    console.log(data);
  }
  
  // - - - - - - - - - - G E T T E R S - - - - - - - - - -
  
  function getTemplateList() {
    ajaxRequest('GET', this.config.serviceUrl, null, 
      function(response) {
        var responseText = JSON.parse(response.responseText);
        self.model.templateList = responseText.data;
        self.templateList.dispatchEvent(templateListSync);
      },
      function(response) {
        console.log(response);
      });
  }
  
  function getTemplate(template) {
    ajaxRequest('GET', this.config.serviceUrl+"?template="+template, null, 
      function(response) {
        var responseText = JSON.parse(response.responseText);
        parseLangIn(responseText.data.template);
        self.model._variables = responseText.data.variables;
        self.templateList.dispatchEvent(templateChange);
      },
      function(response) {
        console.log(response);
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
  this.templateField = {};
  
  this.view.Shell = function() {
    var fragment = document.createDocumentFragment();
    
    var menuField = document.createElement('div');
    menuField.className = 'menuField';
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
    
    var templateField = document.createElement('div');
    templateField.className = 'templateField';
    templateField.contentEditable = true;
    templateField.innerHTML = '<p><br></p>';
    fragment.appendChild(templateField);
    self.templateField = templateField;
    
    return fragment;
  };
  
  this.view.MenuButton = function () {
    var fragment = document.createDocumentFragment();
    
    var menuButton = document.createElement('button');
    menuButton.className = 'button';
    menuButton.value = 'Button';
    fragment.appendChild(menuButton);
    
    return fragment;
  };
  
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * - - - - - - - - - - C O N T R O L L E R - - - - - - - - - -
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  this.hangDownEventListeners = function() {
  	
    this.menuField.addEventListener("templateListSync", function(e) {
	    self.templateList.innerHTML = '';
	    self.languageList.innerHTML = '';
	    self.templateField.innerHTML = '';
//    self.languageList.addClass('hide');
      for (var key in self.model.templateList) {
        var opt = new Option(self.model.templateList[key], key);
        self.templateList.appendChild(opt);
      }
      self.templateList.selectedIndex = -1;
    });
    
    this.shell.addEventListener("templateChange", function(e) {
    	self.languageList.innerHTML = '';
      for (var key in self.model.template) {
      	var opt = new Option(key);
      	self.languageList.appendChild(opt);
      }
      self.languageList.selectedIndex = self.languageList.length-1;
      self.languageList.dispatchEvent(languageChange);
    });
    
    this.templateList.addEventListener("change", function(e) {
    	self.templateField.innerHTML = '';
      getTemplate(self.templateList.value);
    });
    
    this.languageList.addEventListener("change", function(e) {
    	self.languageList.dispatchEvent(languageChange);
    });
    
    this.shell.addEventListener("languageChange", function(e) {
    	e = e || event;
    	var target = e.target || e.srcElement
    	self.templateField.innerText = self.model.template[target.value].join('\n\r');
    });
  };
  
  // - - - - - - - - - - E V E N T S - - - - - - - - - -
  var templateListSync = new CustomEvent("templateListSync", {bubbles: true});
  var templateChange = new CustomEvent("templateChange", {bubbles: true});
  var languageChange = new CustomEvent("languageChange", {bubbles: true});
  
  // - - - - - - - - - - U T I L - - - - - - - - - -
  function parseLangIn(_template) {
    var strArr = _template.split('\r\n');
    var str;
    var result;
    var lang;
    var i = 0;
    // Search {if}
    for (i; i < strArr.length; i++) {
    	result = strArr[i].match(/\{\s*if\s+\$lang\s*==\s*(\w+)\}/i);
    	if (result) {
    		lang = result[1];
    		self.model.template[lang] = [];
    		result = strArr[i].match(/\{\s*if\s+\$lang\s*==\s*\w+\}(.+)$/i);
    		if (result)
    			self.model.template[lang].push(result[1]);
    		i++;
    		break;
    	}
    }
    // Search {else if}, {else}, {/if}
    for (i; i < strArr.length; i++) {
    	str = strArr[i];
    	// Search {else if}
    	result = str.search(/\{\s*else\s*if\s*\$lang\s*==\s*\w+\}/i);
    	if (~result) {
    		result = str.match(/^(.+)\{\s*else\s*if\s*\$lang\s*==\s*\w+\}/i);
    		if ( result && lang ) self.model.template[lang].push( result[1] );
    		result = strArr[i].match(/\{\s*else\s*if\s*\$lang\s*==\s*(\w+)\}/i);
    		lang = result[1];
    		self.model.template[lang] = [];
    		result = str.match(/\{\s*else\s*if\s*\$lang\s*==\s*\w+\}(.+)$/i);
    		if (~result) continue;
    		str = result[1];
    	}
    	// Search {else}
    	result = str.search(/\{\s*else\s*\}/i);
    	if (~result) {
    		result = str.match(/^(.+)\{\s*else\s*\}/i);
    		if ( result && lang ) self.model.template[lang].push( result[1] );
    		lang = 'def';
    		self.model.template[lang] = [];
    		result = str.match(/\{\s*else\s*\}(.+)$/i);
    		if (~result) continue;
    		str = result[1];
    	}
    	//Search {/if}
    	result = str.search(/\{\s*\/\s*if\s*\}/i);
    	if (~result) {
    		result = str.match(/^(.+)\{\s*\/\s*if\s*\}/i);
    		if ( result && lang ) self.model.template[lang].push( result[1] );
    		break;
    	}
    	if (lang) self.model.template[lang].push(str);
    }
//    console.log('template:');
//    console.log(self.model.template);
  };
  
  // - - - - - - - - - - I N I T - - - - - - - - - -
  this.config = config;
  
  this.shell = document.getElementById( config.containerId ).
    appendChild(document.createElement("div"));
  this.shell.className = 'fte-container';
  this.shell.appendChild( new this.view.Shell() );
  
  this.hangDownEventListeners();
  
  getTemplateList();
}