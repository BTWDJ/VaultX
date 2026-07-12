import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_32_byte_secret_key_vault_x_long'),
          },
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt a password successfully', () => {
    const plaintext = 'SuperSecurePassword123!';
    const ciphertext = service.encrypt(plaintext);

    expect(ciphertext).not.toEqual(plaintext);
    expect(ciphertext.split(':')).toHaveLength(3); // iv:tag:ciphertext

    const decrypted = service.decrypt(ciphertext);
    expect(decrypted).toEqual(plaintext);
  });

  it('should fail decryption if ciphertext is tampered', () => {
    const plaintext = 'HelloSecurity';
    const ciphertext = service.encrypt(plaintext);
    const parts = ciphertext.split(':');
    
    // Corrupt the ciphertext part
    parts[2] = parts[2].substring(0, parts[2].length - 2) + '00';
    const tampered = parts.join(':');

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('should throw error if ENCRYPTION_KEY is missing', async () => {
    const mockConfig = {
      get: jest.fn().mockReturnValue(undefined),
    };
    expect(() => new EncryptionService(mockConfig as any)).toThrow('FATAL: ENCRYPTION_KEY environment variable is not defined.');
  });

  it('should throw error if ENCRYPTION_KEY is too short', async () => {
    const mockConfig = {
      get: jest.fn().mockReturnValue('short_key'),
    };
    expect(() => new EncryptionService(mockConfig as any)).toThrow('FATAL: ENCRYPTION_KEY must be at least 32 characters long');
  });
});
