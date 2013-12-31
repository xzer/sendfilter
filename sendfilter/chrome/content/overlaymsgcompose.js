Components.utils.import("resource://gre/modules/iteratorUtils.jsm");

function SendFilter_isSentFolder(folderURI){
	var accountManager = Components.classes["@mozilla.org/messenger/account-manager;1"]
									.getService(Components.interfaces.nsIMsgAccountManager);
	var allIdentities = accountManager.allIdentities;
	var currentIdentity,fccFolder;
	var found = false;
	for (let currentIdentity in fixIterator(allIdentities, Components.interfaces.nsIMsgIdentity)) {
		if (currentIdentity.fccFolder){
			if (currentIdentity.fccFolder == folderURI){
				found = true;
				break;
			}
		}
	}
	return found;
}

var SendFilter_OriginComposeProcessDone=stateListener.ComposeProcessDone;
function SendFilter_ComposeProcessDone(aResult){
	
	var logger = new SendFilter_Logger("SendFilter_ComposeProcessDone()");

	logger.trace("Ready to call the original stateListener.ComposeProcessDone()");

	SendFilter_OriginComposeProcessDone(aResult);
	
	logger.trace("Finished the calling of the original stateListener.ComposeProcessDone()");

	if(aResult == Components.results.NS_OK && SendFilter_isFilterEnable()){
		var folderURI = gMsgCompose.savedFolderURI;
		logger.trace("Message saved at " + folderURI);
		if (SendFilter_isSentFolder(folderURI)){
			logger.trace("call SendFilter_runFilter");
			SendFilter_runFilter(folderURI);
			logger.trace("Finished calling runFilter");
		}else{
			logger.trace("Folder is not Sent Folder");
		}

	}else{
		logger.trace("SendFilter_isFilterEnable = " + SendFilter_isFilterEnable());
		logger.trace("send result = " + aResult + "(Components.results.NS_OK=" + Components.results.NS_OK + ")");
	}

	logger.trace("Finished SendFilter_ComposeProcessDone");
	logger.release();

}
stateListener.ComposeProcessDone = SendFilter_ComposeProcessDone;