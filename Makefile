test:
	./node_modules/.bin/mocha ./test/spec.js
test-all:
	./node_modules/.bin/mocha
lint:
	./node_modules/.bin/jshint ./lib/injectr.js ./test/spec.js ./test/integration.js

.PHONY: test
