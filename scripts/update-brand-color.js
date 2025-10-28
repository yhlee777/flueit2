// Script to update brand color from #51a66f to #03C75A across all files
// This script will be executed automatically

const fs = require("fs")
const path = require("path")

const OLD_COLOR = "#51a66f"
const NEW_COLOR = "#03C75A"

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    const originalContent = content

    // Replace all occurrences (case insensitive)
    content = content.replace(new RegExp(OLD_COLOR, "gi"), NEW_COLOR)

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`✓ Updated: ${filePath}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message)
    return false
  }
}

function walkDirectory(dir, filePattern = /\.(tsx?|jsx?)$/) {
  const files = fs.readdirSync(dir)
  let updatedCount = 0

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules") {
        updatedCount += walkDirectory(filePath, filePattern)
      }
    } else if (filePattern.test(file)) {
      if (replaceInFile(filePath)) {
        updatedCount++
      }
    }
  })

  return updatedCount
}

console.log(`Updating brand color from ${OLD_COLOR} to ${NEW_COLOR}...\n`)

const appUpdated = walkDirectory("./app")
const componentsUpdated = walkDirectory("./components")

console.log(`\n✓ Complete! Updated ${appUpdated + componentsUpdated} files.`)
console.log(`  - App files: ${appUpdated}`)
console.log(`  - Component files: ${componentsUpdated}`)
