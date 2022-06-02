# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.4](https://github.com/yaponyal/ystuty-parser/compare/v0.0.3...v0.0.4) (2022-06-02)


### 🐛 Bug Fixes

* **calendar:** fixed empty organizer name ([0274678](https://github.com/yaponyal/ystuty-parser/commit/0274678bd2d733d7518709a55e22bdb09bbbd300))
* **schedule:** fixed date utc ([c9c6f93](https://github.com/yaponyal/ystuty-parser/commit/c9c6f9381bb378019d7ba876b219f659935d8385))
* **schedule:** fixed date utc ([be7d1b7](https://github.com/yaponyal/ystuty-parser/commit/be7d1b72e4edf2a3d7d1034afdaa59244b7f4ed0))


### 🚀 Features

* added `body-parser` and `scheduler.util` ([388e6a8](https://github.com/yaponyal/ystuty-parser/commit/388e6a8d5f746caf9dfb1e4411d6ff1ab764adbc))
* **docker:** added `ystuty_network` to networks ([30ba861](https://github.com/yaponyal/ystuty-parser/commit/30ba8616d3df008c66d796c21d87670405e595be))
* **models:** added `calendar` model ([1e5d28b](https://github.com/yaponyal/ystuty-parser/commit/1e5d28b19839f643e79bd27cfb1600a624721239))
* **schedule:** added new fields to `lesson` ([04f15ba](https://github.com/yaponyal/ystuty-parser/commit/04f15ba1d103938e9b07c8d2e7f3f6d6526957b9))
* **schedule:** added support exams ([bff43a0](https://github.com/yaponyal/ystuty-parser/commit/bff43a026b3cee32a7e9d67fd424e602806b0b84))


### 🧹 Chore

* added registration modules with ystu password checking ([79d4a9e](https://github.com/yaponyal/ystuty-parser/commit/79d4a9e7d2a9aef66c8ccf703e3ae0e74541d02a))
* **app:** added versioning and global prefix ([bcaffc3](https://github.com/yaponyal/ystuty-parser/commit/bcaffc38ad469373d728b9238f1729eaf2a572e6))
* **app:** changed default `SERVER_PORT` to `8080` ([35ac732](https://github.com/yaponyal/ystuty-parser/commit/35ac732ad415e4f1802fe85b7b5457812d14ecd6))
* **app:** swagger version bump ([119a947](https://github.com/yaponyal/ystuty-parser/commit/119a947f26b05b9900b4e2614a08751a692d839c))
* **deps:** bump moment from 2.29.1 to 2.29.2 ([2aa64b8](https://github.com/yaponyal/ystuty-parser/commit/2aa64b821686af381f8ee3c00ff2c80107554b8a))
* **deps:** bump version `ical-generator` ([38e9aa9](https://github.com/yaponyal/ystuty-parser/commit/38e9aa912063f60fbeaf91889a28f597ab09f365))
* **deps:** update ([d1c16c3](https://github.com/yaponyal/ystuty-parser/commit/d1c16c3f665d628ffeef9cfa1bcede777d79e384))
* **docker:** update ([4afbbee](https://github.com/yaponyal/ystuty-parser/commit/4afbbeec5871417728345e1f15684f93d44478f4))
* **parser:** added calculating week `number` for extramural ([bc83488](https://github.com/yaponyal/ystuty-parser/commit/bc834881145791edabbb5ff9a5ced6ce14fb97ed))
* updates ([deb6e67](https://github.com/yaponyal/ystuty-parser/commit/deb6e6731bb7b68325cc3b6c7f1317348ce3e8f9))
* using global `ValidationHttpPipe` ([79cee83](https://github.com/yaponyal/ystuty-parser/commit/79cee8306b5dbccf5bcf511612c79738579a1bfe))

### [0.0.3](https://github.com/yaponyal/ystuty-parser/compare/v0.0.2...v0.0.3) (2022-02-17)


### 🧹 Chore

* **api:** changed response `data` to `items` ([b59c9e3](https://github.com/yaponyal/ystuty-parser/commit/b59c9e372ee476ef1b4e6511e5609d57490dda3b))
* **exceptions:** updated http exception response ([e6d737e](https://github.com/yaponyal/ystuty-parser/commit/e6d737e651ee742625853c21aab348993938c910))
* **package:** added repository link ([f2edc8e](https://github.com/yaponyal/ystuty-parser/commit/f2edc8e2cd471d9a3eec27d0363739d2b8589464))

### 0.0.2 (2022-02-16)


### 🚀 Features

* **docker:** added docker files 0c2f0fd
* init repos 211525a
* **models:** added `ystu` module with provider 274bdd9
* **project:** added `swagger` 7efdcf9
* **project:** added ystu schedule (parser) 7f09db4
* **project:** adding basic dependencies 09010fb
* **util:** added `cache-manager` b91e2df


### 🌟 Feature Improvements

* **project:** renamed a032942


### 🧹 Chore

* **deps:** added `standard-version` 1791c57
* **prettier:** removed `tabWidth` key 90c9a2b
* **project:** added `cors`, `compression` and `helmet` 5c9b51f
* **project:** changed logger method call in `bootstrap` catch ab62e42
* **project:** prettier c4a37fa
