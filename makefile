.PHONY: build
build:
	docker build -t bandcamp .

.PHONY: run
run:
	docker run -v directory-to-mount:/app  --network=host -it bandcamp src/bandcampScraper.js data/creds.json
