1. edit package.json to increment the version number
2. `export VERSION=<version number>`
3. `git checkout -b release/$VERSION`
4. `git add package.json`
5. `git commit -m "v$VERSION"`
6. `git push origin release/$VERSION`
7. `git tag v$VERSION`
8. `git push --tags`
9. a build should [automatically be kicked off](https://github.com/jeremybmerrill/meaningfully/actions) (and complete successfully, creating a [release](https://github.com/jeremybmerrill/meaningfully/releases))
