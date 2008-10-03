function DialogInit() {

    var chklog = document.getElementById('chkLogging');
	chklog.checked = SendFilter_isLoggingEnable();
    
}

function DialogAccept() {
    var chklog = document.getElementById('chkLogging');
	SendFilter_setLoggingEnable(chklog.checked);
    return true;
}
