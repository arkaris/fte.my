/*
 * Формат запроса:
 * uri:
 *  url.php - обращение к списку шаблонов templateList
 *  url.php?template=templateKey - обращение к шаблону по ключу в templateList
 *  url.php?template=templateKey&variable=variableKey - обращение к переменной variableKey шаблона templateKey
 * method:
 *  GET - чтение данных
 *  PATCH - перезапись данных
 *  POST - запись новых данных
 *  PUT - поиск=>PATCH|PUT
 *  DELETE - удаление данных
 * data:
 *   d: JSON
 */
/*
 * Формат ответа:
 * status:
 *  header("HTTP/1.1 400 Bad Request"); etc.
 * header:
 *  Allow: GET, PATCH
 *  Content-Type: application/json; charset=UTF-8
 * data:
 *  template: текст шаблона
 *  variables: переменные шаблона (мультиязычные)
 *  templateList: перечень шаблонов БЕЗ переменных, БЕЗ имен файлов
 */
/*
 * response.data.template: JSON string
 * 
 * respone.data.variables: {
 *  '{$user}': {ru: "Дмитрий", en: "Dmitry"},
 *  '{$fio}': {ru: "Мячков Д.М.", en: "D. Myachkov"},
 * }
 * 
 * response.data.templateList: {
 *  "tplKey1": {ru: "Имя шаблона", en: "Template Title"},
 *  "tplKey2": {ru: "Имя шаблона", en: "Template Title"},
 * }
 */

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

document.addEventListener("DOMContentLoaded", onDOMLoaded);

function onDOMLoaded() {
  var config = fteGetConfig();
  var fte = new FTE(config);
  fte.init();
}

/* - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - M A I N - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - -
 */
function FTE(config) {
  /* - - - - - - - - - - - - - - - - - - - - - - - - -
   * - - - - - - - - - - M O D E L - - - - - - - - - -
   * - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  this.model = {};
  
  // - - - - - - - - - - A J A X - - - - - - - - - -
  function ajaxRequest(method, data, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method,this.config.servicePath, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status%100 == 2) {
        successCallback ? successCallback(xhr.responseText) : console.log(xhr);
      } else {
        errorCallback ? errorCallback(xhr) : console.log(xhr);
      }
    };
    
    var body = JSON.stringify(data) || '';
    xhr.send(body);
  }
  
  function getTemplateList() {
    ajaxRequest('GET', 'templateList', 
      function(response) {
        var responseText = JSON.parse(response.responseText);
        this.model.templateList = responseText.data;
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
  
  this.view.Shell = function() {
    var fragment = document.createDocumentFragment();
    
    var menuField = document.createElement('div');
    menuField.className = 'menuField';
    fragment.appendChild(menuField);
    self.menu = menuField;
    
    var templateListField = document.createElement('div');
    templateListField.className = "templateListField";
    var templateList = document.createElement('select');
    templateList.className = "templateList";
    var languageList = document.createElement('select');
    language.className = "languageList";
    templateListField.appendChild(templateList);
    templateListField.appendChild(languageList);
    menuField.appendChild(templateListField);
    self.templateList = templateList;
    
    var variableField = document.createElement('div');
    variableField.className = "variableField";
    menuField.appendChild(variableField);
    self.variableField = variableField;
    
    var templateField = document.createElement('div');
    templateField.className = 'textField';
    fragment.appendChild(templateField);
    self.templateField = templateField;
    
    return fragment;
  };
  
  this.view.Template = function() {
    var fragment = document.createDocumentFragment();
    
    var textField = document.createElement('div');
    textField.contentEditable = true;
    textField.innerHTML = '<p><br></p>';
    fragment.appendChild(textField);
    
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
  function fillTemplateList() {
    getTemplateList();
    self.templateList.innerHTML = '';
    
    for (var key in self.model.templateList) {
      var opt = new Option(data[key], key);
      self.templateList.appendChild(opt);
    }
    self.templateList.selectedIndex = -1;
  }
  
  // - - - - - - - - - - E V E N T S - - - - - - - - - -
  
  // - - - - - - - - - - I N I T - - - - - - - - - -
  this.init = function() {
    self = this;
    this.config = config;
    
    this.shell = document.getElementById( config.containerId ).
      appendChild(document.createElement("div"));
    this.shell.className = 'fte-container';
    this.shell.appendChild( new this.view.Shell(this) );
    
    fillTemplateList(this);
  };
}

/*
 * templateList = {
 *   tplKey: {
 *     fileName: value
 *     templateName: value
 *     variables: {
 *       '{key}': {
 *         ru: value,
 *         en: value
 *       }
 *     }
 *   }
 * }
 */
