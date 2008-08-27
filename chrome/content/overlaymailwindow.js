function SendFilter_RunFiltersAfterSendLater(){
	var logger = new SendFilter_Logger("SendFilter_RunFiltersAfterSendLater()");
	if ( !SendFilter_isFilterEnable() ) {
		logger.trace("sendfilter not enable, return");
		logger.release();
		return;
	}
	if (accountManager) {
		logger.trace("Ready to run filters");
		var allIdentities = accountManager.allIdentities;
		var identitiesCount = allIdentities.Count();
		var currentIdentity,fccFolder;
		for (var i = 0; i < identitiesCount; i++) {
			currentIdentity = allIdentities.QueryElementAt(i, Components.interfaces.nsIMsgIdentity);
			if (currentIdentity.fccFolder){
				logger.trace("call filter at " + currentIdentity.fccFolder);
				SendFilter_runFilter(currentIdentity.fccFolder);
			}
		}
	}
	logger.trace("End SendFilter_RunFiltersAfterSendLater()");
	logger.release();
}

/**
 * Because we can't get a notification from sending thread,so we
 * have to query the status of progress bar and wait for the sending
 * thread finished.
 */
var SendFilter_WaitHandler = {
	
	feedback : null,
	
	ontimer : function(){
		
		var logger = new SendFilter_Logger("SendFilter_WaitHandler.ontimer()");

		if (SendFilter_WaitHandler.feedback) {
			logger.trace("feedback is true");
			if (SendFilter_WaitHandler.feedback.meteorsSpinning){
				logger.trace("register timer again");
				SendFilter_WaitHandler.registerTimer();
			}else{
				logger.trace("call SendFilter_RunFiltersAfterSendLater()");
				SendFilter_RunFiltersAfterSendLater();
				SendFilter_WaitHandler.feedback = null;
			}
		}
		logger.trace("Finished SendFilter_WaitHandler.ontimer");
		logger.release();
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
	var logger = new SendFilter_Logger("SendFilter_SendUnsentHooker()");
	logger.trace("Ready to call SendUnsentMessages");

	SendFilter_SendUnsentHookee();
	
	logger.trace("After calling SendUnsentMessages");

	if (!SendFilter_WaitHandler.feedback){
		logger.trace("Not feedback, register a timer to wait");
		SendFilter_WaitHandler.feedback = window.MsgStatusFeedback;
		SendFilter_WaitHandler.registerTimer();
	}

	logger.trace("End SendFilter_SendUnsentHooker()");
	logger.release();

}
SendUnsentMessages = SendFilter_SendUnsentHooker;