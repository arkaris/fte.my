{if $lang==eng}Dear {$user}!

Thank you for registration at {$site}.
Now you can order via your e-mail complimentary tickets to all exhibitions held at Exhibition Complex which are connected to your profession.  

To get a complimentary ticket to the «{$ex}» Exhibition and to activate your login, please follow the link below.  

Login activation: 
{$link}

We thank you for your attention and hope you will understand our security measures.

Please remember your login in the ticket booking system: {$email}
Please remember your password in the ticket booking system: {$password}

If the link does not work or you have any problems registering, please e-mail to {$smarty.const.TECHNICAL_SUPPORT}

We hope you enjoy your work with us! 

Best regards,
{$smarty.const.RC_ADMINISTRATION}

{else}
Уважаемый(ая) {$user}

Мы благодарим Вас за регистрацию на сайте {$site}

Для завершения регистрации и чтобы получить пригласительный билет на выставку «Экспо 2015», пройдите, пожалуйста, по указанной ниже ссылке

Активация логина:
{$link}

Напоминаем Ваш логин для входа в систему заказа билетов: {$email}
Напоминаем Ваш пароль для входа в систему заказа билетов: {$password}

Если Вы не можете пройти по ссылке или у Вас возникли проблемы с регистрацией, обратитесь в службу технической поддержки: help@techsupport.ru.


С уважением,
Организатор выставки
«Экспо 2015»

{*$email}
{$password}
{$smarty.const.TECHNICAL_SUPPORT}
{$smarty.const.RC_ADMINISTRATION*}
{/if}