/* - - - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - C O N F I G - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
function fteGetConfig(){
  config = {
    //id of div element for FTE
    containerId: "FTEContainer",
    //data request addres
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
  
  // - - - - - - - - - - A J A X - - - - - - - - - -
  function ajaxRequest(method, url, data, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (~~(xhr.status/100) == 2) {
        successCallback ? successCallback(xhr) : console.log(xhr);
        console.log('take:');
        console.log(JSON.parse(xhr.responseText));
      } else {
        errorCallback ? errorCallback(xhr) : console.log(xhr);
      }
    };
    
    var body = JSON.stringify(data) || '';
    xhr.send(body);
    console.log('send:');
    console.log(data);
    console.log('to: '+url);
  }
  
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
        self.model.template = responseText.data.template;
        self.model.variables = responseText.data.variables;
        self.templateList.dispatchEvent(templateListChange);
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
//    self.languageList.addClass('hide');
      
      for (var key in self.model.templateList) {
        var opt = new Option(self.model.templateList[key], key);
        self.templateList.appendChild(opt);
      }
      self.templateList.selectedIndex = -1;
    });
    
    this.templateList.addEventListener("change", function(e) {
      getTemplate(self.templateList.value);
    });
    
    this.shell.addEventListener("templateListChange", function(e) {
      self.templateField.innerText = self.model.template;
//    self.languageList.remClass('hide');
      
      
    });
  };
  
  // - - - - - - - - - - E V E N T S - - - - - - - - - -
  var templateListSync = new CustomEvent("templateListSync", {bubbles: true});
  var templateListChange = new CustomEvent("templateListChange", {bubbles: true});
  
  // - - - - - - - - - - I N I T - - - - - - - - - -
  this.config = config;
  
  this.shell = document.getElementById( config.containerId ).
    appendChild(document.createElement("div"));
  this.shell.className = 'fte-container';
  this.shell.appendChild( new this.view.Shell() );
  
  this.hangDownEventListeners();
  
  getTemplateList();
}