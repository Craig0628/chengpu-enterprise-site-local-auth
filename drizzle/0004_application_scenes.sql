CREATE TABLE `application_scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`subtitle` text,
	`description` text,
	`imageUrl` text,
	`icon` varchar(32),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` tinyint(1) NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `application_scenes_id` PRIMARY KEY(`id`)
);
