CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`jwt_token` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `builds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pid` text,
	`repo_id` integer NOT NULL,
	`commit_sha` text,
	`image_sha` text,
	`tag` text,
	`release_url` text,
	`registry_url` text,
	`built_with` text,
	`built_by` text,
	`object_path` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`repo_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pid` text,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`org` text,
	`repo_url` text,
	`registry_url` text,
	`public` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`session_token` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	`full_name` text,
	`github_id` integer,
	`github_login` text,
	`github_avatar_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_jwt_token_unique` ON `api_keys` (`jwt_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `jwt_token_idx` ON `api_keys` (`jwt_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `builds_pid_idx` ON `builds` (`pid`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_pid_idx` ON `projects` (`pid`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_session_token_unique` ON `user_sessions` (`session_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_idx` ON `user_sessions` (`session_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `uid_idx` ON `users` (`uid`);