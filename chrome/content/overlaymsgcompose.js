var originComposeProcessDone=stateListener.ComposeProcessDone;
function SendFilter_ComposeProcessDone(aResult){
	
	originComposeProcessDone(aResult);
	
	if(aResult == Components.results.NS_OK && SendFilter_isFilterEnable()){
		SendFilter_runFilter(gMsgCompose.savedFolderURI);
	}

}
stateListener.ComposeProcessDone = SendFilter_ComposeProcessDone;