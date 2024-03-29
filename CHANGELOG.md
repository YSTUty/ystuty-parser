# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.21](https://github.com/YSTUty/ystuty-parser/compare/v0.0.20...v0.0.21) (2024-01-13)


### 🐛 Bug Fixes

* **parser:** check `timeRange` for correct data ([d0f04e3](https://github.com/YSTUty/ystuty-parser/commit/d0f04e3d98c93f34f229e48e0418afc737576e36))
* **readme:** change server host on badges ([88138d2](https://github.com/YSTUty/ystuty-parser/commit/88138d21812e4a3cdefcf5bfb2dc3f94a83ad4e4))


### 🧹 Chore

* **common:** add `unsupported` lesson flag ([091dcdb](https://github.com/YSTUty/ystuty-parser/commit/091dcdb15445a88688ff6cf480069e402f80d2c0))
* **parser:** adding correct week number for exam dates with day info ([043bb82](https://github.com/YSTUty/ystuty-parser/commit/043bb82cf5ba106121e50c76577494bc6d419431))

### [0.0.20](https://github.com/YSTUty/ystuty-parser/compare/v0.0.19...v0.0.20) (2023-01-18)


### 🚀 Features

* **ystu:** add parsing `exams` by teachers ([459734d](https://github.com/YSTUty/ystuty-parser/commit/459734d99cbdb4bc9f3ecc6b39e9a70277dd3144))


### 🐛 Bug Fixes

* **parser:** fix auto calculate start semester date ([cd1c1dc](https://github.com/YSTUty/ystuty-parser/commit/cd1c1dcc53617de626abe93c39b719f188ff642a))
* **ystu:** fix collect of teacher exams ([4e14516](https://github.com/YSTUty/ystuty-parser/commit/4e1451643ce8696f247d2aa5abe5d94f6a6a5f80))
* **ystu:** fix formation of date interval ([35ed0b3](https://github.com/YSTUty/ystuty-parser/commit/35ed0b3c6fc7c45785779b80e18bfd008181e03a))


### 🧹 Chore

* **calendar:** add `allDay` flag for event ([b872793](https://github.com/YSTUty/ystuty-parser/commit/b872793c34e67740b311b4fbbf95fd6b22352025))

### [0.0.19](https://github.com/YSTUty/ystuty-parser/compare/v0.0.18...v0.0.19) (2023-01-13)


### 🐛 Bug Fixes

* add `short` param to schedule cache path ([edd581d](https://github.com/YSTUty/ystuty-parser/commit/edd581db39fc7186361feab87a85ada23d38fdf3))
* **parser:** correct year for schedule date in semester after new year ([91c0dfc](https://github.com/YSTUty/ystuty-parser/commit/91c0dfc294302d12fd18ede52eeca7b00b483572))

### [0.0.18](https://github.com/YSTUty/ystuty-parser/compare/v0.0.17...v0.0.18) (2022-12-15)


### 🐛 Bug Fixes

* **parser:** fixed incorrect schedule date calculating (year) ([06f902f](https://github.com/YSTUty/ystuty-parser/commit/06f902f0a014e42329768d758ef5ce010f5936d1))


### 🌟 Feature Improvements

* **ystu:** updated groups schedule parsing ([ac3810d](https://github.com/YSTUty/ystuty-parser/commit/ac3810dd19b10b838ad4ed534b745c22448aff74))

### [0.0.17](https://github.com/YSTUty/ystuty-parser/compare/v0.0.16...v0.0.17) (2022-12-14)


### 🐛 Bug Fixes

* **readme:** fixed badges url ([21719e2](https://github.com/YSTUty/ystuty-parser/commit/21719e2c09bbc7fc7fb0dbc0ff25a644d5317d2a))


### 🧹 Chore

* **provider:** increased parsing date interval ([9cd4e0d](https://github.com/YSTUty/ystuty-parser/commit/9cd4e0d74c82619fa3bf7e45bf942e17b5e93d68))


### 🚀 Features

* **app:** added support proxy agent ([dd2b4c5](https://github.com/YSTUty/ystuty-parser/commit/dd2b4c51c26da19a53e2f47305336b4ce131e312))

### [0.0.16](https://github.com/YSTUty/ystuty-parser/compare/v0.0.15...v0.0.16) (2022-12-07)


### 🧹 Chore

* **cache:** returning cloned data on read ([2290466](https://github.com/YSTUty/ystuty-parser/commit/229046636f8d216eea6b8f5a48a600033e6c532a))
* **docker:** move `build` to `production` layer ([dcff728](https://github.com/YSTUty/ystuty-parser/commit/dcff728386381c1b99620c5daac8eb3b47eee217))
* **parser:** added normalizer for xids in schedule links ([0f7f082](https://github.com/YSTUty/ystuty-parser/commit/0f7f0825224ffdb11a861089cc1922cdb8cbd862))
* **util:** updated calculating memory size ([74c5d10](https://github.com/YSTUty/ystuty-parser/commit/74c5d1047f9c2d8a21736f12169a32492ba91891))


### 🐛 Bug Fixes

* **parser:** checking `timeRange` to incorrect value ([e326b11](https://github.com/YSTUty/ystuty-parser/commit/e326b1111f255c90b322bc0f11f2f06469451951))
* **provider:** fixed checking `timeout` error for try get cache data ([c00a2ee](https://github.com/YSTUty/ystuty-parser/commit/c00a2eea61c8776582538c7ba5aae1d3a109976a))
* **provider:** fixed generating cache file path ([26e82ec](https://github.com/YSTUty/ystuty-parser/commit/26e82ecce782fd3773dd8e5dd6872c6d8fbfe112))
* **provider:** fixed incorrect returning cache data ([43a0b08](https://github.com/YSTUty/ystuty-parser/commit/43a0b0867198f0aa1eedd505f8720a1a7e3b6667))
* **provider:** not overwrite cached `links` by empty data ([24340f8](https://github.com/YSTUty/ystuty-parser/commit/24340f8896fcca63a0205c828eb0e0616861e12f))
* **util:** fixed typos normalizer schedule links ([851400a](https://github.com/YSTUty/ystuty-parser/commit/851400a579749cd44af17c44f7ffa38353568f52))


### 🚀 Features

* **ystu:** added rate limiter for `provider` ([4136bea](https://github.com/YSTUty/ystuty-parser/commit/4136bea3ffdc84f4f8e5515ec057f52c87c5dbe8))
* **ystu:** loading accumulative schedule from cache in `collector` ([dbd1719](https://github.com/YSTUty/ystuty-parser/commit/dbd1719825c55022783d88c640971319d57ee35c))

### [0.0.15](https://github.com/YSTUty/ystuty-parser/compare/v0.0.14...v0.0.15) (2022-12-02)


### 🚀 Features

* **env:** added chunk size for collector queue ([ebb1694](https://github.com/YSTUty/ystuty-parser/commit/ebb1694100c8759e7eddff9f317702af28e3fe7e))


### 🐛 Bug Fixes

* **calendar:** check nullable teacher ([fec5ecf](https://github.com/YSTUty/ystuty-parser/commit/fec5ecfb3b46d258cbb64bd1d378d21ecda29585))


### 🧹 Chore

* **app:** return `uptime` to seconds ([61681e4](https://github.com/YSTUty/ystuty-parser/commit/61681e4f11b81cbef102bdc3e67694abf6a67f2f))
* **env:** added default cache ttl env variable for http fetch ([af8f506](https://github.com/YSTUty/ystuty-parser/commit/af8f5062331669c729e0824f9f254f21bd2af264))
* **ystu:** auto-cyclic updating institute links ([bea663c](https://github.com/YSTUty/ystuty-parser/commit/bea663cb9d7ad7468532e50b35ad86fdbbb2c262))
* **ystu:** check on `null` response ([b3ea695](https://github.com/YSTUty/ystuty-parser/commit/b3ea695501062e32b52cb91ab959daf5bf1dda1d))

### [0.0.14](https://github.com/YSTUty/ystuty-parser/compare/v0.0.13...v0.0.14) (2022-12-01)


### 🐛 Bug Fixes

* **ystu:** fixed auth ([8f9b7ad](https://github.com/YSTUty/ystuty-parser/commit/8f9b7ad369d8140733e6790776b01aa5e641266e))


### 🌟 Feature Improvements

* **cache:** configurable default ttl and deleting garbage `onlyMemory` ([80ecf0f](https://github.com/YSTUty/ystuty-parser/commit/80ecf0f2d311bd56696fd4d2a19193cb80a161ec))
* **ystu:** added `offline` mode ([89f6925](https://github.com/YSTUty/ystuty-parser/commit/89f69256181376b20ed093d8f5f9a8f7547d9aa8))


### 🚀 Features

* **env:** added configurable `timeout` for ystu http request ([f4c8e74](https://github.com/YSTUty/ystuty-parser/commit/f4c8e74982a27f052e23275130f24c9e72fec2cc))
* **env:** added configurable delays ([15325bf](https://github.com/YSTUty/ystuty-parser/commit/15325bf443d87ec152fc305d7b4d052df86eed47))

### [0.0.13](https://github.com/YSTUty/ystuty-parser/compare/v0.0.12...v0.0.13) (2022-11-02)


### 🐛 Bug Fixes

* **provider:** added intercept `set-cookie` on redirects ([0fda0e4](https://github.com/YSTUty/ystuty-parser/commit/0fda0e443175b8eda7e851bfbf7b5c3245249550))

### [0.0.12](https://github.com/YSTUty/ystuty-parser/compare/v0.0.11...v0.0.12) (2022-10-07)


### 🧹 Chore

* **deps:** update ([d99b4e1](https://github.com/YSTUty/ystuty-parser/commit/d99b4e15b2c70a85958a6f1575acc24a6376a425))
* **ystu:** make schedule group name to lowercase ([8ebb520](https://github.com/YSTUty/ystuty-parser/commit/8ebb520571632eeefdf308e4d2f5c3b0bced1530))

### [0.0.11](https://github.com/YSTUty/ystuty-parser/compare/v0.0.10...v0.0.11) (2022-10-07)


### 🚀 Features

* **cache:** added garbage clearing of cache ([8f570b3](https://github.com/YSTUty/ystuty-parser/commit/8f570b3a0f5877d6f92bdb8ede222829f844c0c5))


### 🧹 Chore

* **app:** getting `cache` size ([c79c72b](https://github.com/YSTUty/ystuty-parser/commit/c79c72bf00c67d0b8ec69add8facbf3db93ef0ea))
* **cache:** updated `ttl` ([90f0725](https://github.com/YSTUty/ystuty-parser/commit/90f07254aa06be93d14301c0d215bc39bc6c57c1))
* **provider:** removed `headers` from file hash cache name ([95f75b0](https://github.com/YSTUty/ystuty-parser/commit/95f75b0d55c8215942d0f98d2170fcbd2c38cc2e))


### 🐛 Bug Fixes

* **provider:** fixed authorization by cookies ([6a3d23a](https://github.com/YSTUty/ystuty-parser/commit/6a3d23a9eb3003463100ba51a996900559f2d640))

### [0.0.10](https://github.com/YSTUty/ystuty-parser/compare/v0.0.9...v0.0.10) (2022-09-30)


### 🚀 Features

* **docker:** optimized cache layers ([9a3ad2e](https://github.com/YSTUty/ystuty-parser/commit/9a3ad2e91ee642a548bec3daf01da65ae8c393c2))


### 🐛 Bug Fixes

* **provider:** fixed null file name because of `bypassCache` ([53911d5](https://github.com/YSTUty/ystuty-parser/commit/53911d58984e4a52803f06ba34a0fcc8846841b2))

### [0.0.9](https://github.com/YSTUty/ystuty-parser/compare/v0.0.8...v0.0.9) (2022-09-29)


### 🐛 Bug Fixes

* **calendar:** fixed calendar generating data ([69359b3](https://github.com/YSTUty/ystuty-parser/commit/69359b3fd856aaa20634a960856504c7db20b661))
* **parser:** added support empty `lessonTypeStr` value ([06a3c66](https://github.com/YSTUty/ystuty-parser/commit/06a3c66d27d0b0633751868fcd552c8cc6627e6a))


### 🚀 Features

* added `prettier` and `editorconfig` ([d153cab](https://github.com/YSTUty/ystuty-parser/commit/d153cab8847a285515346ccc52447aa68188e6e5))
* **collector:** added accumulative schedule ([3254d10](https://github.com/YSTUty/ystuty-parser/commit/3254d107298851cd50c8f3bbd1086c774006fc46))
* **collector:** added collector service ([68ea398](https://github.com/YSTUty/ystuty-parser/commit/68ea398e31bae7fa2064274a87297b4c6d6c7c43))
* **parser:** added schedule parsing for auditories ([a3d3056](https://github.com/YSTUty/ystuty-parser/commit/a3d3056d810f006d85bbdab363b9cfb537c92d18))


### 🧹 Chore

* **env:** added `SERVER_URL` param to example ([5ea4a6f](https://github.com/YSTUty/ystuty-parser/commit/5ea4a6fe9e86b55d0ea84a24cb1e98487a3f69b1))
* prettier ([eed161d](https://github.com/YSTUty/ystuty-parser/commit/eed161d15eaa22e855fbbd105fbbc9e188502115))
* **provider:** added `bypassCache` param for fetch ([acf50e9](https://github.com/YSTUty/ystuty-parser/commit/acf50e951df89e93ce24306aebe65d034e468870))
* **service:** updated `ttl` for caching group schedule ([a5bc46a](https://github.com/YSTUty/ystuty-parser/commit/a5bc46a1dbb6643c78212ab450e294d8a239ad85))
* **typos:** renamed `auditory` to `audience` ([5b42396](https://github.com/YSTUty/ystuty-parser/commit/5b42396d1cc467b33aa9e9c81d5686d5feb000f9))
* **ystu:** removed `formData` and added `datt` generator ([7db0c10](https://github.com/YSTUty/ystuty-parser/commit/7db0c10c9bf01b395061d71120e8e5028014c829))

### [0.0.8](https://github.com/YSTUty/ystuty-parser/compare/v0.0.7...v0.0.8) (2022-09-01)


### ⚠ BREAKING CHANGES

* **parser:** It is necessary to clear cache. The previous cache may contain an outdated format

### 🚀 Features

* added env option to disable getting user info ([d555985](https://github.com/YSTUty/ystuty-parser/commit/d55598556463737996801a93a980787aa4810a2a))
* **parser:** added support multi lecture links ([37742a7](https://github.com/YSTUty/ystuty-parser/commit/37742a73c8315241f74245b2df542c047e94c906))

### [0.0.7](https://github.com/YSTUty/ystuty-parser/compare/v0.0.5...v0.0.7) (2022-09-01)


### 🌟 Feature Improvements

* **parser:** getting week type by short name ([be8caa5](https://github.com/YSTUty/ystuty-parser/commit/be8caa5d8c533ff72f2d1b18e71f428eb4f0a095))


### 🐛 Bug Fixes

* **parser:** fixred calculating `durationMinutes` ([0ee2b2f](https://github.com/YSTUty/ystuty-parser/commit/0ee2b2f4274c87af94d01e23358ade3ef2e4a5af))
* **provider:** fixed fetch post data by `FormData` ([3f5c7e1](https://github.com/YSTUty/ystuty-parser/commit/3f5c7e139400a8f06b879efeec13c0653deade2a))


### 🚀 Features

* added license file ([732a5ca](https://github.com/YSTUty/ystuty-parser/commit/732a5cadbc8a259b5ba6a0cabe5ffaf02dec8979))
* **calendar:** added generating teacher ical ([8401755](https://github.com/YSTUty/ystuty-parser/commit/840175530eef63c0b56aee9d04c10292b3cf6aab))
* **controller:** added `teachers` to count route ([ab8ab8d](https://github.com/YSTUty/ystuty-parser/commit/ab8ab8de2e476f905447c48db9257e4cd4ce5114))
* **controller:** added route to get amount of available schedule data ([a715cb5](https://github.com/YSTUty/ystuty-parser/commit/a715cb5524f546bc6bd1bc2740ba7c11715b32e8))
* **controller:** added swagger docs for teacher ([4f80828](https://github.com/YSTUty/ystuty-parser/commit/4f808288534088ff0df6bbe67d6b6962f4f38a5a))
* **project:** updated main links and logo ([11ee304](https://github.com/YSTUty/ystuty-parser/commit/11ee304362b4a4a9e6f1e8fea16f4aefb00c96d6))
* **teacher:** added schedule parsing for teachers ([6b933fc](https://github.com/YSTUty/ystuty-parser/commit/6b933fcbc14c8bf57167e83ef25a83ce73e778bd))


### 🧹 Chore

* **calendar:** removed `/file` deprecated route for group ([82747a4](https://github.com/YSTUty/ystuty-parser/commit/82747a4b88c352684df7e1f70ae8bafa02eaab06))
* **controller:** added app version route ([68ff916](https://github.com/YSTUty/ystuty-parser/commit/68ff9168de52b61cf3c20e3e55c1439f700fc3ef))
* **deps:** updated ([6525ea2](https://github.com/YSTUty/ystuty-parser/commit/6525ea24021c4a99e7df74ac2cd64f73a39317bb))
* **release:** 0.0.6 ([0c4b634](https://github.com/YSTUty/ystuty-parser/commit/0c4b6342bedffbfe3e038b1b755ed63b5b03d915))

### [0.0.6](https://github.com/YSTUty/ystuty-parser/compare/v0.0.5...v0.0.6) (2022-09-01)


### 🌟 Feature Improvements

* **parser:** getting week type by short name ([be8caa5](https://github.com/YSTUty/ystuty-parser/commit/be8caa5d8c533ff72f2d1b18e71f428eb4f0a095))


### 🐛 Bug Fixes

* **parser:** fixred calculating `durationMinutes` ([0ee2b2f](https://github.com/YSTUty/ystuty-parser/commit/0ee2b2f4274c87af94d01e23358ade3ef2e4a5af))
* **provider:** fixed fetch post data by `FormData` ([3f5c7e1](https://github.com/YSTUty/ystuty-parser/commit/3f5c7e139400a8f06b879efeec13c0653deade2a))


### 🚀 Features

* added license file ([732a5ca](https://github.com/YSTUty/ystuty-parser/commit/732a5cadbc8a259b5ba6a0cabe5ffaf02dec8979))
* **calendar:** added generating teacher ical ([8401755](https://github.com/YSTUty/ystuty-parser/commit/840175530eef63c0b56aee9d04c10292b3cf6aab))
* **controller:** added `teachers` to count route ([ab8ab8d](https://github.com/YSTUty/ystuty-parser/commit/ab8ab8de2e476f905447c48db9257e4cd4ce5114))
* **controller:** added route to get amount of available schedule data ([a715cb5](https://github.com/YSTUty/ystuty-parser/commit/a715cb5524f546bc6bd1bc2740ba7c11715b32e8))
* **controller:** added swagger docs for teacher ([4f80828](https://github.com/YSTUty/ystuty-parser/commit/4f808288534088ff0df6bbe67d6b6962f4f38a5a))
* **project:** updated main links and logo ([11ee304](https://github.com/YSTUty/ystuty-parser/commit/11ee304362b4a4a9e6f1e8fea16f4aefb00c96d6))
* **teacher:** added schedule parsing for teachers ([6b933fc](https://github.com/YSTUty/ystuty-parser/commit/6b933fcbc14c8bf57167e83ef25a83ce73e778bd))


### 🧹 Chore

* **calendar:** removed `/file` deprecated route for group ([82747a4](https://github.com/YSTUty/ystuty-parser/commit/82747a4b88c352684df7e1f70ae8bafa02eaab06))
* **controller:** added app version route ([68ff916](https://github.com/YSTUty/ystuty-parser/commit/68ff9168de52b61cf3c20e3e55c1439f700fc3ef))
* **deps:** updated ([6525ea2](https://github.com/YSTUty/ystuty-parser/commit/6525ea24021c4a99e7df74ac2cd64f73a39317bb))

### [0.0.5](https://github.com/yaponyal/ystuty-parser/compare/v0.0.4...v0.0.5) (2022-08-28)


### 🚀 Features

* **parser:** improved lessons parsing ([b7159a0](https://github.com/yaponyal/ystuty-parser/commit/b7159a0aab4257809ddcd062f84a5db8731cbe0f))
* **provider:** added customizing `IDraspz` value ([137c757](https://github.com/yaponyal/ystuty-parser/commit/137c757d1b6f8049efe533a0c6fba8b925e60a1b))
* updated ystu summer ([b92e214](https://github.com/yaponyal/ystuty-parser/commit/b92e214338f7da0d92b391beee8fd8901f2e3182))

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
