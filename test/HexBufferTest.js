"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const HexBuffer_1 = require("../lib/HexBuffer");
var hexBuffer;
var h = () => hexBuffer.getBuffer();
describe('HexBuffer', function () {
    beforeEach(function () {
        // clear the buffer before each test in this block so we
        // don't have to care about what we added in prior tests
        hexBuffer = new HexBuffer_1.HexBuffer();
    });
    it('should addString', function () {
        var testWords = [
            'Hallo, wêreld!',
            'Pershëndetje Botë',
            'أهلاً بالعالم',
            'Բարե՛ւ, աշխարհ։',
            'Salam Dünya',
            'Ahoj Světe!',
            'Kaixo mundua!',
            'Прывітанне свет',
            'Shani Mwechalo!',
            'Shagatam Prithivi!',
            'Zdravo Svijete!',
            'Здравей, свят!',
            'ជំរាបសួរ ពិភពលោក',
            'Hola món!',
            '你好世界',
            'ᎣᏏᏲ ᎡᎶᎯ',
            'Klahowya Hayas Klaska',
            'Bok Svijete!',
            'Hej, Verden!',
            'Hallo, wereld!',
            'Hello World!',
            'Saluton mondo!',
            'Tere maailm!',
            'Hei maailma!',
            'Salut le Monde!',
            'Hallo, wrâld!',
            'Ola mundo!',
            'Hallo Welt!',
            'Γεια σου κόσμε!',
            'Aloha Honua',
            'שלום עולם',
            'नमस्ते दुनिया',
            'Nyob zoo ntiaj teb.',
            'Helló világ!',
            'Halló heimur!',
            'Ndewo Ụwa',
            'Halo Dunia!',
            'Dia dhaoibh, a dhomhain!',
            'Ciao Mondo!',
            'こんにちは、 世界！',
            'ಹಲೋ ವರ್ಲ್ಡ್',
            'Habari dunia!',
            'Niatia thi!',
            'nuqneH',
            '반갑다 세상아',
            'ສະບາຍດີ,ໂລກ',
            'AVE MVNDE',
            'Sveika, Pasaule!',
            'Sveikas, Pasauli',
            'coi li terdi',
            'Moien Welt!',
            'Manao ahoana ry tany!',
            'Namaskaram, lokame',
            'Merhba lid-dinja',
            'Hallo verden!',
            '!سلام دنیا',
            'Witaj świecie!',
            'Olá, mundo!',
            'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ',
            'Salut lume!',
            'Здравствуй, мир!',
            'Halò, a Shaoghail!',
            'Zdravo Svete!',
            'Ahoj, svet!',
            'Pozdravljen svet!',
            '¡Hola mundo!',
            'Hallå världen!',
            'Kamusta mundo!',
            'ஹலோ உலகம்',
            'హలో వరల్డ్',
            'สวัสดีโลก!',
            'Merhaba Dünya!',
            'Привiт, свiте!',
            'ہیلو دنیا والو',
            'Xin chào thế giới',
            'S\'mae byd!',
            'העלא וועלט',
            'Sawubona Mhlaba',
        ];
        var totalLength = 0;
        for (var w in testWords) {
            var bufLength = Buffer.from(testWords[w]).length;
            hexBuffer.addString(testWords[w], false);
            totalLength += bufLength;
            assert_1.default.equal(h().length, totalLength);
        }
    });
    it('should addString null-terminated', function () {
        hexBuffer.addString('hello world', true);
        assert_1.default.equal(h().length, 12); // now it has a null-terminator at the end
        assert_1.default.equal(h()[11], 0); // last character should be the null terminator
    });
    it('should addNewLine', function () {
        hexBuffer.addNewLine();
        assert_1.default.equal(h().length, 2);
        assert_1.default.equal(h()[0], 0x0d);
        assert_1.default.equal(h()[1], 0x0a);
    });
    it('should addChar', function () {
        hexBuffer.addChar('A');
        assert_1.default.equal(h().length, 1);
        assert_1.default.equal(h()[0], 65); // charcode for the ASCII letter "A"
    });
    it('should addInt', function () {
        hexBuffer.addInt(0);
        assert_1.default.equal(h().length, 4); // integer is 4 bytes in length
        assert_1.default.equal(h()[0], 0x00);
        assert_1.default.equal(h()[1], 0x00);
        assert_1.default.equal(h()[2], 0x00);
        assert_1.default.equal(h()[3], 0x00);
    });
    it('should addShort', function () {
        hexBuffer.addShort(14);
        assert_1.default.equal(h().length, 2); // 2 bytes in length
        assert_1.default.equal(h()[0], 0x0e);
        assert_1.default.equal(h()[1], 0x00);
    });
    it('should addFloat', function () {
        hexBuffer.addFloat(1.234);
        assert_1.default.equal(h().length, 4); // 4 bytes in length
        assert_1.default.equal(h()[0], 0xb6);
        assert_1.default.equal(h()[1], 0xf3);
        assert_1.default.equal(h()[2], 0x9d);
        assert_1.default.equal(h()[3], 0x3f);
    });
    it('should addByte', function () {
        hexBuffer.addByte(15);
        assert_1.default.equal(h()[0], 15);
    });
    it('should addNullTerminator', function () {
        hexBuffer.addNullTerminator();
        assert_1.default.equal(h().length, 1);
        assert_1.default.equal(h()[0], 0);
    });
    it('should getBuffer', function () {
        hexBuffer.addString('');
        assert_1.default(hexBuffer.getBuffer()); // test if this function works
    });
});
//# sourceMappingURL=HexBufferTest.js.map