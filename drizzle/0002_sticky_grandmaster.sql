ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isLocalAuthEnabled` boolean DEFAULT false NOT NULL;