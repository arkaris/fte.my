<?php
class FTERequest {
  private $templateList = array (
    "testCP1" => array (
      "fileName" => "testCP.tpl",
      "templateName" => "Тестовый шаблон 1",
      "variables" => array (
        '{$user}' => array ("ru"=>"Дмитрий", "eng"=>"Dmitry"),
        '{$site}' => array ("ru"=>"megaSite.ru", "eng"=>"megaSite.ru"),
        '{$ex}'   => array ("ru"=>"Лучшая выставка", "eng"=>"Best exhibition"),
				'{$email}'=> array ("ru"=>"our@email.ru", "eng"=>"our@email.ru")
      )
    ),
    "testCP2" => array (
      "fileName" => "testCP.tpl",
      "templateName" => "Тестовый шаблон 2",
      "variables" => array (
        '{$user}' => array ("ru"=>"Дмитрий", "eng"=>"Dmitry"),
        '{$site}' => array ("ru"=>"megaSite.ru", "eng"=>"megaSite.ru"),
        '{$ex}'   => array ("ru"=>"Лучшая выставка", "eng"=>"Best exhibition"),
				'{$email}'=> array ("ru"=>"our@email.ru", "eng"=>"our@email.ru")
      )
    )
  );
  
  public function __construct($request) {
    $this->request = $request;
    $this->method = $_SERVER["REQUEST_METHOD"];
    $this->templateKey = $this->getRequestParam("template");
    $this->variableKey = $this->getRequestParam("variable");
    
    try {
      
      if ($this->method=="GET") {
        if ( isset($this->templateKey) && empty($this->variableKey) ) {
          $this->getTemplate($this->templateKey);
        } else 
        if ( empty($this->templateKey) && empty($this->variableKey) ) {
          $this->getTemplateList();
        } else {
          throw new Exception("Bad Request", 400);
        }
      }
      
      else throw new Exception("Method Not Allowed", 405);
      
    } catch (Exception $e) {
      header("HTTP/1.1 " . $e->getCode() . " " . $e->getMessage());
    }
//  if ( isset($this->data) ) {}
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
  
  public function renderToString() {
    $json = array(
      "data" => $this->data,
    );
    return json_encode($json);
  }
  
  public function showResponse() {
    header("Content-Type: application/json; charset=UTF-8");
    echo $this->response;
  }
  
  /*
   * - - - - - C A L L B A C K - - - - -
   */
  public function getTemplateList() {
    foreach ($this->templateList as $key => $value) {
      $this->setResponse($key, $value["templateName"]);
    }
    
    //header("Allow: GET");
    throw new Exception("OK", 200);
  }
  
  public function getTemplate($templateKey) {
    if ( $this->templateList[$templateKey] && file_exists($this->templateList[$templateKey]["fileName"]) ) {
      $this->template = file_get_contents($this->templateList[$templateKey]["fileName"]);
      $this->template = iconv("windows-1251", "UTF-8", $this->template);
      
      //header("Allow: GET");
      $this->setResponse("template", $this->template);
      $this->setResponse("variables", $this->templateList[$templateKey]["variables"]);
      
      throw new Exception("OK", 200);
    } else {
      throw new Exception("Not Found", 404);
    }
  }
}

$ajaxRequest = new FTERequest($_REQUEST);
$ajaxRequest->showResponse();
?>