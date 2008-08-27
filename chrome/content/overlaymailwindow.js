function SendFilter_RunFiltersAfterSendLater(){
	if ( !SendFilter_isFilterEnable() ) {
		return;
	}
	if (accountManager) {
		var allIdentities = accountManager.allIdentities;
		var identitiesCount = allIdentities.Count();
		var currentIdentity,fccFolder;
    for (var i = 0; i < identitiesCount; i++) {
    	currentIdentity = allIdentities.QueryElementAt(i, Components.interfaces.nsIMsgIdentity);
    	fccFolder = currentIdentity.fccFolder;
    	if (fccFolder){
    		SendFilter_runFilter(currentIdentity.fccFolder);
    	}
    }
	}
}

/**
 * Because we can't get a notification from sending thread,so we
 * have to query the status of progress bar and wait for the sending
 * thread finished.
 */
var SendFilter_WaitHandler = {
	
	feedback : null,
	
	ontimer : function(){
		if (SendFilter_WaitHandler.feedback) {
			if (SendFilter_WaitHandler.feedback.meteorsSpinning){
				SendFilter_WaitHandler.registerTimer();
			}else{
				SendFilter_RunFiltersAfterSendLater();
				SendFilter_WaitHandler.feedback = null;
			}
		}
	},
	
	registerTimer : function(){
		setTimeout("SendFilter_WaitHandler.ontimer()",1000);	
	}
	
}

/*
 * This hooker to hook the SendUnsentMessages function so that 
 * we can response the event of send later.
 */
var SendFilter_SendUnsentHookee = SendUnsentMessages;
function SendFilter_SendUnsentHooker(){
	SendFilter_SendUnsentHookee();
	if (!SendFilter_WaitHandler.feedback){
		SendFilter_WaitHandler.feedback = window.MsgStatusFeedback;
		SendFilter_WaitHandler.registerTimer();
	}
}
SendUnsentMessages = SendFilter_SendUnsentHooker;