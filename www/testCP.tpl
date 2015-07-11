{if $lang==eng}Dear {$user}!

Thank you for registration at {$site}.
Now you can order via your e-mail complimentary tickets to all exhibitions held at Exhibition Complex which are connected to your profession.  

To get a complimentary ticket to the �{$ex}� Exhibition and to activate your login, please follow the link below.  

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
���������(��) {$user}

�� ���������� ��� �� ����������� �� ����� {$site}

��� ���������� ����������� � ����� �������� ��������������� ����� �� �������� ������ 2015�, ��������, ����������, �� ��������� ���� ������

��������� ������:
{$link}

���������� ��� ����� ��� ����� � ������� ������ �������: {$email}
���������� ��� ������ ��� ����� � ������� ������ �������: {$password}

���� �� �� ������ ������ �� ������ ��� � ��� �������� �������� � ������������, ���������� � ������ ����������� ���������: help@techsupport.ru.


� ���������,
����������� ��������
������ 2015�

{*$email}
{$password}
{$smarty.const.TECHNICAL_SUPPORT}
{$smarty.const.RC_ADMINISTRATION*}
{/if}