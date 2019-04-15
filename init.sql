create user 'wcstravelapi'@'localhost' identified by 'TravelApi2019';
create database wcs_travel_api character set utf8 collate utf8_unicode_ci;
use wcs_travel_api;
grant all privileges on wcs_travel_api.* to 'wcstravelapi'@'localhost';
flush privileges;