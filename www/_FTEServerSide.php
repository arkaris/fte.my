<?php
//{act:get|set, target:filename, data:json}-формат запроса
//{status:ok|err, code:DOMTarget, message:message, data:obj}-формат ответа

class FTERequest {
  //временная замена templateList:
  public $templateList = array (
    "testCP" => array (
      "fileName" => "testCP.tpl",
      "templateName" => "Тестовый Шаблон 1",
      "variables" => array (
        '{$user}' => "Дмитрий",
        '{$site}' => "megaSite.ru",
        '{$ex}' => "Лучшая Выставка",
        '{$link}' => "ссылка на активацию"
      )
    ),
    "myTemp" => array (
      "fileName" => "myTemp.tpl",
      "templateName" => "Тестовый Шаблон 2",
      "variables" => array (
        '{$user}' => "Дмитрий",
        '{$site}' => "megaSite.ru",
        '{$ex}' => "Лучшая Выставка",
        '{$link}' => "ссылка на активацию"
      )
    )
  );
  
  public $actions = array (
    "getList" => "getTemplateList",
    "get" => "getTemplate",
    "set" => "setTemplate"
  );

  public $data;
  public $code;
  public $message;
  public $status;
  
  public function __construct($request) {
    $this->request = $request;
    $this->action = $this->getRequestParam("act");
    if (!empty($this->actions[$this->action])) {
      $this->callback = $this->actions[$this->action];
      call_user_func(array($this, $this->callback));
    } else {
      header("HTTP/1.1 400 Bad Request");
      $this->setFieldError("main", "Некорректный запрос");
    }
    $this->response = $this->renderToString();
  }
  
  public function getRequestParam($name) {
    if (array_key_exists($name, $this->request)) {
      return stripcslashes(htmlspecialchars(trim($this->request[$name])));
    }
    return null;
  }
  
  public function setResponse($key, $value) {
    $this->data[$key] = $value;
  }
  
  public function setFieldError($name, $message = "") {
    $this->status = "err";
    $this->code = $name;
    $this->message = $message;
  }
  
  public function renderToString() {
    $this->json = array(
      "status" => $this->status,
      "code" => $this->code,
      "message" => $this->message,
      "data" => $this->data,
    );
    return json_encode($this->json);
  }
  
  public function showResponse() {
    header("Content-Type: application/json; charset=UTF-8");
    echo $this->response;
  }
  
  public function getTemplateList() {
    $this->status = "ok";
    $this->code = "templateList";
    $this->message = "Access granted";
    foreach ($this->templateList as $key => $value) {
      $this->setResponse($key, $value["templateName"]);
    }
  }
  
  public function getTemplate() {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
      header("Allow: POST");
      $this->setFieldError("main", "Method Not Allowed");
      return;
    }
    
    $target = $this->getRequestParam('target');
    if ($this->templateList[$target] && file_exists($this->templateList[$target]["fileName"])) {
      $this->template = file_get_contents($this->templateList[$target]["fileName"]);
      $this->template=iconv("windows-1251", "UTF-8", $this->template); 
    }
    if (!empty($this->template)) {
      $this->status = "ok";
      $this->code = "template";
      $this->message = "Access granted";
      $this->setResponse("template", $this->template);
      $this->setResponse("variables", $this->templateList[$target]["variables"]);
    } else {
      header("Allow: POST");
      $this->setFieldError("main", "Wrong Template Name");
    }
  }
  
  public function setTemplate() {
      $file = fopen($templateList[$target]["fileName"], "rb");
      $this->template = stream_get_contents($file);
      fclose($file);
  }
}

$ajaxRequest = new FTERequest($_REQUEST);
$ajaxRequest->showResponse();
?>