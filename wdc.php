<?php
/**
 * A system to pull Fred Data into a WDC Tableau Connector.
 * 
 * @author Derrick Austin <derrick.austin@interworks.com>
 * @author Robert Rouse <robert.rouse@interworks.com>
 */

require_once('libs/fred/fred_api.php');
$api_key = '[api_key_here]';

if (empty($_GET['wdc_ids'])) {
	die('Error: No Fred Id Specified.');
}

$return = array();
foreach (json_decode($_GET['wdc_ids'], true) as $vals) {
	$id = $vals['id'];
	$friendlyname = $vals['title'];
	
	$api = fred_api::factory('series', $api_key);
	$results = json_decode($api->observations(array(
		'series_id'      => $id,
		'file_type'      => 'json',
		'realtime_start' => '1900-01-01',
	)));
	
	$fields[] = $friendlyname;
	
	foreach ($results->observations as $el) {
		$key = str_replace('-', '_', $el->date);
		if (array_key_exists($key, $return)) {
			$return[$key][$friendlyname] = floatval($el->value);
		} else {
			//add series call to get title
			$return[$key] = array(
				'date'        => $el->date,
				$friendlyname => floatval($el->value),
			);
		}
	}
}

$data = array();
$fieldNames = array('Date');
$fieldTypes = array('date');

// Fill in missing results.
foreach ($return as $date => $el) {
	foreach ($fields as $id) {
		if (empty($return[$date][$id])) {
			$return[$date][$id] = null;
		}
	}
}

// Register Fields
foreach ($fields as $el) {
	$fieldNames[] = $el;
	$fieldTypes[] = 'float';
}

// Populate rows
foreach ($return as $el) {
	$add = array('Date' => $el['date']);
	foreach ($fields as $f) {
		$add[$f] = empty($el[$f]) ? null : floatval($el[$f]);
	}
	$data[] = $add;
}

header('Content-Type: application/json');
echo json_encode(array(
	'dataToReturn' => $data,
	'fieldNames'   => $fieldNames,
	'fieldTypes'   => $fieldTypes,
));
