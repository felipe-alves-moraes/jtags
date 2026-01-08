#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version>"
    echo "Example: ./release.sh 0.1.0"
    exit 1
fi

# Calculate next version (increment patch)
IFS='.' read -ra PARTS <<< "$VERSION"
NEXT_PATCH=$((PARTS[2] + 1))
NEXT_VERSION="${PARTS[0]}.${PARTS[1]}.$NEXT_PATCH-SNAPSHOT"

echo "==> Releasing version: $VERSION"
echo "==> Next development version: $NEXT_VERSION"

# Set release version
mvn versions:set -DnewVersion=$VERSION -DgenerateBackupPoms=false

# Build
mvn clean install

# Commit release version
git add pom.xml */pom.xml
git commit -m "chore: release v$VERSION"
git push origin main

# Run JReleaser
mvn -N jreleaser:full-release

# Set next snapshot version
mvn versions:set -DnewVersion=$NEXT_VERSION -DgenerateBackupPoms=false

# Commit next version
git add pom.xml */pom.xml
git commit -m "chore: prepare for next development iteration"
git push origin main

echo "==> Released $VERSION successfully!"