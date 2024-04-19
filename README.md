# Stardew Dialogue Editor

This is a web tool for creating and editing Stardew Valley game dialogue.

## Features

* Add and remove messages from existing dialogues
* Translatable interface using the excellent [Fluent syntax](https://projectfluent.org/)
* Page theme adapts to user's browser light/dark mode preference

### Planned features

* Manage multiple dialogues
    * Including support for multiple NPCs
* Support for browsing/uploading a file to parse
* Dialogue translation support
* Dialogue key parsing/creation
    * GUI for choosing game criteria, e.g. NPC friendship, flags, events
* Export of dialogues to either a game JSON file or a Content Patcher patch

## Running locally
### Requirements
* nodejs (>= 16.0)
* npm

### Installing
1. Run `npm install`

### Running
1. Run

```npm run dev```

2. If you want to expose the server to your network, for example for testing on mobile devices, instead run

```npm run dev -- --host```