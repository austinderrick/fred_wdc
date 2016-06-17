
/**
 * A system to pull Fred Data into a WDC Tableau Connector.
 *
 * @author Derrick Austin <derrick.austin@interworks.com>
 * @author Robert Rouse <robert.rouse@interworks.com>
 */

window.cachedTableData;

var fredConnector = tableau.makeConnector();
fredConnector.init = function () {
	tableau.connectionName = 'FRED data';
	tableau.initCallback();
};

fredConnector.getColumnHeaders = function() {
	_getOurData(function(data) {
		tableau.headersCallback(
			window.cachedTableData['fieldNames'],
			window.cachedTableData['fieldTypes']
		);
	});
};

fredConnector.getTableData = function(lastRecordToken) {
	_getOurData(function(data) {
		tableau.dataCallback(
			window.cachedTableData['dataToReturn'],
			lastRecordToken,
			false
		);
	});
};

tableau.registerConnector(fredConnector);

function addWDC(id, title) {
	//remove select text
	$('#select-text').html('');
	
	//check if id already exists. If not, append it at the top.
	if ($('#wdc-list>div[data-id=' + id + ']').length == 0) {
		$("#wdc-list").prepend("<div data-id=" + id + ">" + id + " - " + title + "</div>");
	}
	
	updateWDCList();
}

function addGroup(group) {
	//get list of IDs
	var presetList = $.grep(presets, function (n) {
		return n.group === group;
	});

	//add an item for each ID in the list
	$(presetList[0].values).each(function () {
		addWDC(this.id, this.title);
	});

	updateWDCList();
}

function updateWDCList()
{
	//populate list from data attributes of divs
	list = $("#wdc-list>div").map(function() {
		return {
			id    : $(this).data("id"),
			title : $(this).html()
		};
	}).get();
	
	//add select text if cleared
	if (!list || list == '' || list.length == 0) {
		$('#wdc-list').html('<span id=select-text>Select metrics using the buttons on the left.</span>');
		$('#get-wdc').hide();
		$('#clear-wdc').hide();
		return;
	}
	
	//insert vals into form input and show buttons
	$("#wdc-ids").val(JSON.stringify(list));
	$('#get-wdc').show();
	$('#clear-wdc').show();
}

function _getOurData(callback)
{
	if (!window.cachedTableData) {
		$('body').append('<div class="loadingScreen"><img src="/resources/Solutions_Animation.gif" /></div>');
		$.ajax({
			'url'  : 'wdc.php',
			'data' : {
				'wdc_ids' : tableau.connectionData
			}
		}).done(function (data) {
			window.cachedTableData = data;
			callback(window.cachedTableData);
			$('.loadingScreen').remove();
		});
	} else {
		callback(window.cachedTableData);
	}
}

$(function() {
	$('.fred-search').hide();
	$('.warning-msg').hide();
	$('.back-black').hide();
	
	$('#get-wdc').click(function () {
		tableau.connectionData = $('#wdc-ids').val();
		tableau.submit();
	});

	$('#clear-wdc').click(function() {
		$("#wdc-ids").val('');
		$('#wdc-list').html('<span id=select-text>Select metrics using the buttons on the left.</span>');
		updateWDCList();
	});

	$('#search-wdc').click(function() {
		$.ajax({
			'url'  : 'search.php',
			'data' : {
				'search' : $('#fred-search').val()
			}
		}).done(function (data) {
			$('#search-results').html(data);
		});
	});
	
	/**
	 * Presets
	 **/
	$('.fred-icon').click(function () {
			var groupName=$(this).data('group');
			if(groupName!="search") {
				addGroup(groupName);
			} else {
				$('.fred-search').show();
				$('.icon-container').hide();
			}
	});
	/**
	 * End Presets
	 **/
	
	$('#search-cancel').click(function() {
		$('.fred-search').hide();
		$('.icon-container').show();
		$('#search-results').html('');
	});
	
	$('form').submit(function(e) {
		$('#search-wdc').click();
		e.preventDefault();
	});
	
	if (typeof tableauVersionBootstrap  == 'undefined' || !tableauVersionBootstrap) {
		$('.warning-msg').show();
	}
});

$(updateWDCList);
