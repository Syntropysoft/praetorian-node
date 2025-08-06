import { FileAdapterFactory } from '../../../src/infrastructure/adapters/FileAdapterFactory';
import { YamlFileAdapter } from '../../../src/infrastructure/adapters/readers/YamlFileAdapter';
import { JsonFileAdapter } from '../../../src/infrastructure/adapters/readers/JsonFileAdapter';
import { EnvFileAdapter } from '../../../src/infrastructure/adapters/readers/EnvFileAdapter';
import { TomlFileAdapter } from '../../../src/infrastructure/adapters/readers/TomlFileAdapter';
import { IniFileAdapter } from '../../../src/infrastructure/adapters/readers/IniFileAdapter';
import { XmlFileAdapter } from '../../../src/infrastructure/adapters/readers/XmlFileAdapter';
import { PropertiesFileAdapter } from '../../../src/infrastructure/adapters/readers/PropertiesFileAdapter';
import { HclFileAdapter } from '../../../src/infrastructure/adapters/readers/HclFileAdapter';
import { PlistFileAdapterV2 } from '../../../src/infrastructure/adapters/readers/PlistFileAdapterV2';

describe('FileAdapterFactory', () => {
  describe('getAdapter', () => {
    it('should return YamlFileAdapter for .yaml files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.yaml');
      expect(adapter).toBeInstanceOf(YamlFileAdapter);
    });

    it('should return YamlFileAdapter for .yml files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.yml');
      expect(adapter).toBeInstanceOf(YamlFileAdapter);
    });

    it('should return JsonFileAdapter for .json files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.json');
      expect(adapter).toBeInstanceOf(JsonFileAdapter);
    });

    it('should return EnvFileAdapter for .env files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.env');
      expect(adapter).toBeInstanceOf(EnvFileAdapter);
    });

    it('should return EnvFileAdapter for env.* files', () => {
      const adapter = FileAdapterFactory.getAdapter('env.production');
      expect(adapter).toBeInstanceOf(EnvFileAdapter);
    });

    it('should return TomlFileAdapter for .toml files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.toml');
      expect(adapter).toBeInstanceOf(TomlFileAdapter);
    });

    it('should return IniFileAdapter for .ini files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.ini');
      expect(adapter).toBeInstanceOf(IniFileAdapter);
    });

    it('should return IniFileAdapter for .cfg files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.cfg');
      expect(adapter).toBeInstanceOf(IniFileAdapter);
    });

    it('should return IniFileAdapter for .conf files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.conf');
      expect(adapter).toBeInstanceOf(IniFileAdapter);
    });

    it('should return XmlFileAdapter for .xml files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.xml');
      expect(adapter).toBeInstanceOf(XmlFileAdapter);
    });

    it('should return PropertiesFileAdapter for .properties files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.properties');
      expect(adapter).toBeInstanceOf(PropertiesFileAdapter);
    });

    it('should return HclFileAdapter for .hcl files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.hcl');
      expect(adapter).toBeInstanceOf(HclFileAdapter);
    });

    it('should return HclFileAdapter for .tf files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.tf');
      expect(adapter).toBeInstanceOf(HclFileAdapter);
    });

    it('should return HclFileAdapter for .tfvars files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.tfvars');
      expect(adapter).toBeInstanceOf(HclFileAdapter);
    });

    it('should return PlistFileAdapterV2 for .plist files', () => {
      const adapter = FileAdapterFactory.getAdapter('config.plist');
      expect(adapter).toBeInstanceOf(PlistFileAdapterV2);
    });

    it('should throw error for unsupported file format', () => {
      expect(() => {
        FileAdapterFactory.getAdapter('config.txt');
      }).toThrow('Unsupported file format: config.txt');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return all supported extensions', () => {
      const extensions = FileAdapterFactory.getSupportedExtensions();
      
      expect(extensions).toContain('.yaml');
      expect(extensions).toContain('.yml');
      expect(extensions).toContain('.json');
      expect(extensions).toContain('.env');
      expect(extensions).toContain('.toml');
      expect(extensions).toContain('.ini');
      expect(extensions).toContain('.cfg');
      expect(extensions).toContain('.conf');
      expect(extensions).toContain('.xml');
      expect(extensions).toContain('.properties');
      expect(extensions).toContain('.hcl');
      expect(extensions).toContain('.tf');
      expect(extensions).toContain('.tfvars');
      expect(extensions).toContain('.plist');
    });
  });

  describe('isSupported', () => {
    it('should return true for supported file formats', () => {
      expect(FileAdapterFactory.isSupported('config.yaml')).toBe(true);
      expect(FileAdapterFactory.isSupported('config.json')).toBe(true);
      expect(FileAdapterFactory.isSupported('config.toml')).toBe(true);
      expect(FileAdapterFactory.isSupported('config.properties')).toBe(true);
      expect(FileAdapterFactory.isSupported('config.hcl')).toBe(true);
      expect(FileAdapterFactory.isSupported('config.plist')).toBe(true);
    });

    it('should return false for unsupported file formats', () => {
      expect(FileAdapterFactory.isSupported('config.txt')).toBe(false);
      expect(FileAdapterFactory.isSupported('config.doc')).toBe(false);
    });
  });

  describe('getAllAdapters', () => {
    it('should return all registered adapters', () => {
      const adapters = FileAdapterFactory.getAllAdapters();
      
      expect(adapters).toHaveLength(9); // YAML, JSON, ENV, TOML, INI, XML, Properties, HCL, PLIST
      expect(adapters.some(adapter => adapter instanceof YamlFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof JsonFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof EnvFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof TomlFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof IniFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof XmlFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof PropertiesFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof HclFileAdapter)).toBe(true);
      expect(adapters.some(adapter => adapter instanceof PlistFileAdapterV2)).toBe(true);
    });
  });
}); 