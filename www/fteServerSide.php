<?php
class FTERequest {
  private $templateList = array (
    "testCP1" => array (
      "fileName" => "testCP.tpl",
      "templateName" => "Тестовый шаблон 1",
      "variables" => array (
        '{$user}' => array ("ru"=>"Дмитрий", "en"=>"Dmitry"),
        '{$site}' => array ("i13n"=>"megaSite.ru"),
        '{$ex}'   => array ("ru"=>"Лучшая выставка", "en"=>"Best exhibition")
      )
    ),
    "testCP2" => array (
      "fileName" => "testCP.tpl",
      "templateName" => "Тестовый шаблон 2",
      "variables" => array (
        '{$user}' => array ("ru"=>"Дмитрий", "en"=>"Dmitry"),
        '{$site}' => array ("i13n"=>"megaSite.ru"),
        '{$ex}'   => array ("ru"=>"Лучшая выставка", "en"=>"Best exhibition")
      )
    )
  );
  
  public function __construct($request) {
    $this->method = $_SERVER["REQUEST_METHOD"];
    $this->templateKey = $this->getRequestParam("templateKey");
    $this->variableKey = $this->getRequestParam("variableKey");
    
    try {
      
      if ($this->method=="GET") {
        if ( isset($this->templateKey) && empty($this->variableKey) ) {
          $this->getTemplate($this->templateKey);
        };
        if ( empty($this->templateKey) && empty($this->variableKey) ) {
          $this->getTemplateList();
        };
        throw new Exception("Bad Request", 400);
      }
      
      throw new Exception("Method Not Allowed", 405);
      
    } catch (Exception $e) {
      header("HTTP/1.1 " . $e.getMessage() . " " . $e.getCode());
    }
  }
  
  public function getRequestParam($name) {
    if (array_key_exists($name, $this->request)) {
      return stripcslashes(htmlspecialchars(trim($this->request[$name])));
    }
    return null;
  }
}

$ajaxRequest = new FTERequest($_REQUEST);
$ajaxRequest->showResponse();
?>