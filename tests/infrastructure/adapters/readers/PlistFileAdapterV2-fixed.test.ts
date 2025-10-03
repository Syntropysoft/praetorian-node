/**
 * PlistFileAdapterV2 Fixed Test
 * 
 * This test verifies that the PLIST bug has been fixed
 */

import { PlistFileAdapterV2 } from '../../../../src/infrastructure/adapters/readers/PlistFileAdapterV2';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('PlistFileAdapterV2 Fixed Test', () => {
  let adapter: PlistFileAdapterV2;
  let tempDir: string;

  beforeEach(() => {
    adapter = new PlistFileAdapterV2();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should parse arrays with objects correctly (bug fix)', async () => {
    // Arrange - This is the problematic PLIST content from README
    const problematicPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>configs</key>
    <array>
        <dict>
            <key>debug</key>
            <true/>
            <key>env</key>
            <string>dev</string>
        </dict>
        <dict>
            <key>debug</key>
            <false/>
            <key>env</key>
            <string>prod</string>
        </dict>
    </array>
</dict>
</plist>`;

    const expectedResult = {
      configs: [
        { debug: true, env: 'dev' },
        { debug: false, env: 'prod' }
      ]
    };

    const tempFile = path.join(tempDir, 'test.plist');
    fs.writeFileSync(tempFile, problematicPlistContent);

    // Act
    const result = await adapter.read(tempFile);

    // Assert - This should now work with the fix
    expect(result).toEqual(expectedResult);
  });

  it('should still work with simple arrays', async () => {
    // Arrange - Simple array that should work
    const simplePlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>simpleArray</key>
    <array>
        <string>item1</string>
        <string>item2</string>
    </array>
</dict>
</plist>`;

    const expectedResult = {
      simpleArray: ['item1', 'item2']
    };

    const tempFile = path.join(tempDir, 'simple.plist');
    fs.writeFileSync(tempFile, simplePlistContent);

    // Act
    const result = await adapter.read(tempFile);

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should still work with nested dictionaries', async () => {
    // Arrange - Nested dict that should work
    const nestedDictContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>nested</key>
    <dict>
        <key>inner</key>
        <string>value</string>
    </dict>
</dict>
</plist>`;

    const expectedResult = {
      nested: {
        inner: 'value'
      }
    };

    const tempFile = path.join(tempDir, 'nested.plist');
    fs.writeFileSync(tempFile, nestedDictContent);

    // Act
    const result = await adapter.read(tempFile);

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
