var originComposeProcessDone=stateListener.ComposeProcessDone;
function SendFilter_ComposeProcessDone(aResult){
	
	var logger = new SendFilter_Logger("SendFilter_ComposeProcessDone()");

	logger.trace("Ready to call the original stateListener.ComposeProcessDone()");

	originComposeProcessDone(aResult);
	
	logger.trace("Finished the calling of the original stateListener.ComposeProcessDone()");

	if(aResult == Components.results.NS_OK && SendFilter_isFilterEnable()){
		SendFilter_runFilter(gMsgCompose.savedFolderURI);
		logger.trace("Finished calling runFilter");
	}else{
		logger.trace("SendFilter_isFilterEnable = " + SendFilter_isFilterEnable());
		logger.trace("send result = " + aResult + "(Components.results.NS_OK=" + Components.results.NS_OK + ")");
	}

	logger.trace("Finished SendFilter_ComposeProcessDone");
	logger.release();

}
stateListener.ComposeProcessDone = SendFilter_ComposeProcessDone;