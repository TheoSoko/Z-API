*** ***
 TESTS

*** ***

*** Gets followed things with country ***
SELECT `sources_types`.`name`, `countries`.`name`
FROM `user_follows` as `follow`
	JOIN `sources_types`
	    ON `sources_types`.`id` = `follow`.`source_type_id`
	JOIN `countries`
	    ON `countries`.`id` = `follow`.`country_id`
	WHERE `follow`.`user_id` = 7

UNION

SELECT `thematics`.`name`, `countries`.`name`
FROM `user_follows` as `follow`
	JOIN `thematics`
	    ON `thematics`.`id` = `follow`.`thematic_id`
	JOIN `countries`
	    ON `countries`.`id` = `follow`.`country_id`
	WHERE `follow`.`user_id` = 7


*** Gets the followed countries **
SELECT `countries`.`name_code`
FROM `user_follows` as `follow`
	JOIN `countries`
	    ON `countries`.`id` = `follow`.`country_id`
	WHERE `follow`.`user_id` = 7
    	AND `follow`.`thematic_id` IS NULL

