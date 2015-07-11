<?php
class TemplateList {
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
}
?>