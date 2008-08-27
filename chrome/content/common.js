const SENDFILTER_KEY="net.xzer.sendfiler.enable";
var myPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);

function SendFilter_isFilterEnable(){
		var isEnable = false;
		try{
			isEnable = myPrefBranch.getBoolPref(SENDFILTER_KEY);
		}catch(ex){
			//
		}
		return isEnable;
}

function SendFilter_setFilterEnable(b){
	myPrefBranch.setBoolPref(SENDFILTER_KEY,b);
}

function SendFilter_runFilter(folderURI)
{
  var rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
  var resource = rdf.GetResource(folderURI);
  var msgFolder = resource.QueryInterface(Components.interfaces.nsIMsgFolder);
  var filterService = Components.classes["@mozilla.org/messenger/services/filters;1"].getService(Components.interfaces.nsIMsgFilterService);
  var filterList = filterService.getTempFilterList(msgFolder);
  var folders = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
  folders.AppendElement(msgFolder);

	var curFilterList = msgFolder.getFilterList(msgWindow);
  
  // make sure the tmp filter list uses the real filter list log stream
  filterList.logStream = curFilterList.logStream;
  filterList.loggingEnabled = curFilterList.loggingEnabled;
	var numFilters = curFilterList.filterCount;
	
	 var newFilterIndex = 0;
  for (var i = 0; i < numFilters; i++)
  {
    var curFilter = curFilterList.getFilterAt(i);
    if (curFilter.enabled && !curFilter.temporary) // only add enabled, UI visibile filters
    {
      filterList.insertFilterAt(newFilterIndex, curFilter);
      newFilterIndex++;
    }
  }
  filterService.applyFiltersToFolders(filterList, folders, msgWindow);
}