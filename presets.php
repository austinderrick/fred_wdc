<?php
/**
 * A system to pull Fred Data into a WDC Tableau Connector.
 *
 * @author Derrick Austin <derrick.austin@interworks.com>
 * @author Robert Rouse <robert.rouse@interworks.com>
 */

require_once('libs/fred/fred_api.php');
$api_key = '5a6efc3b9ea2112ee2bb6abef689342f';

if (empty($_GET['wdc_ids'])) {
	die('Error: No Fred Id Specified.');
}

$return = array();
foreach (json_decode($_GET['wdc_ids'], true) as $id) {
	$api = fred_api::factory('series', $api_key);
	
	$meta = json_decode($api->get(array(
		'series_id'      => $id,
		'file_type'      => 'json'
	)));
	
	$info = $meta->seriess;
	$title = $info[0]->title;
	$return[] = array(
		'id'    => $id,
		'title' => $title
	);
}

header('Content-Type: application/json');
echo json_encode(array(
	'values' => $return,
));

