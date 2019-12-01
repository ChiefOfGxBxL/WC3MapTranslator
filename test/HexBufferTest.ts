import assert from 'assert';
import { HexBuffer } from "../lib/HexBuffer";

var hexBuffer;
var h = () => hexBuffer.getBuffer();

describe('HexBuffer', function () {

    beforeEach(function () {
        // clear the buffer before each test in this block so we
        // don't have to care about what we added in prior tests
        hexBuffer = new HexBuffer();
    });

    it('should addString', function () {

        var testWords = [
            'Hallo, wêreld!', // Afrikaans
            'Pershëndetje Botë', // Albanian
            'أهلاً بالعالم', // Arabic
            'Բարե՛ւ, աշխարհ։', // Armenian
            'Salam Dünya', // Azeri
            'Ahoj Světe!', // Czech
            'Kaixo mundua!', // Basque/Euskara
            'Прывітанне свет', // Belarusian
            'Shani Mwechalo!', // Bemba
            'Shagatam Prithivi!', // Bengali
            'Zdravo Svijete!', // Bosnian
            'Здравей, свят!', // Bulgarian
            'ជំរាបសួរ ពិភពលោក', // Cambodian
            'Hola món!', // Catalan
            '你好世界', // Chinese
            'ᎣᏏᏲ ᎡᎶᎯ', // Cherokee
            'Klahowya Hayas Klaska', // Chinook Wawa
            'Bok Svijete!', // Croatian
            'Hej, Verden!', // Danish
            'Hallo, wereld!', // Dutch
            'Hello World!', // English
            'Saluton mondo!', // Esperanto
            'Tere maailm!', // Estonian
            'Hei maailma!', // Finnish
            'Salut le Monde!', // French
            'Hallo, wrâld!', // Frisian
            'Ola mundo!', // Galician
            'Hallo Welt!', // German
            'Γεια σου κόσμε!', // Greek
            'Aloha Honua', // Hawaiian
            'שלום עולם', // Hebrew
            'नमस्ते दुनिया', // Hindi
            'Nyob zoo ntiaj teb.', // Hmong
            'Helló világ!', // Hungarian
            'Halló heimur!', // Icelandic
            'Ndewo Ụwa', // Igbo
            'Halo Dunia!', // Indonesian
            'Dia dhaoibh, a dhomhain!', // Irish
            'Ciao Mondo!', // Italian
            'こんにちは、 世界！', // Japanese
            'ಹಲೋ ವರ್ಲ್ಡ್', // Kannada
            'Habari dunia!', // Kiswahili
            'Niatia thi!', // Kikuyu
            'nuqneH', // Klingon
            '반갑다 세상아', // Korean
            'ສະບາຍດີ,ໂລກ', // Lao
            'AVE MVNDE', // Latin
            'Sveika, Pasaule!', // Latvian
            'Sveikas, Pasauli', // Lithuanian
            'coi li terdi', // Lojban
            'Moien Welt!', // Luxembourgish
            'Manao ahoana ry tany!', // Malagasy
            'Namaskaram, lokame', // Malayalam
            'Merhba lid-dinja', // Maltese
            'Hallo verden!', // Norwegian
            '!سلام دنیا', // Persian
            'Witaj świecie!', // Polish
            'Olá, mundo!', // Portuguese
            'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੁਨਿਆ', // Punjabi
            'Salut lume!', // Romanian
            'Здравствуй, мир!', // Russian
            'Halò, a Shaoghail!', // Scots Gaelic
            'Zdravo Svete!', // Serbian
            'Ahoj, svet!', // Slovak
            'Pozdravljen svet!', // Slovenian
            '¡Hola mundo!', // Spanish
            'Hallå världen!', // Swedish
            'Kamusta mundo!', // Tagalog
            'ஹலோ உலகம்', // Tamil
            'హలో వరల్డ్', // Telugu
            'สวัสดีโลก!', // Thai
            'Merhaba Dünya!', // Turkish
            'Привiт, свiте!', // Ukrainian
            'ہیلو دنیا والو', // Urdu
            'Xin chào thế giới', // Vietnamese
            'S\'mae byd!', // Welsh
            'העלא וועלט', // Yiddish
            'Sawubona Mhlaba', // Zulu
        ]

        var totalLength = 0;
        for (var w in testWords) {
            var bufLength = Buffer.from(testWords[w]).length;
            hexBuffer.addString(testWords[w], false);
            totalLength += bufLength;
            assert.equal(h().length, totalLength);
        }

    });

    it('should addString null-terminated', function () {
        hexBuffer.addString('hello world', true);
        assert.equal(h().length, 12); // now it has a null-terminator at the end
        assert.equal(h()[11], 0); // last character should be the null terminator
    });

    it('should addNewLine', function () {
        hexBuffer.addNewLine();
        assert.equal(h().length, 2);
        assert.equal(h()[0], 0x0d);
        assert.equal(h()[1], 0x0a);
    });

    it('should addChar', function () {
        hexBuffer.addChar('A');
        assert.equal(h().length, 1);
        assert.equal(h()[0], 65); // charcode for the ASCII letter "A"
    });

    it('should addInt', function () {
        hexBuffer.addInt(0);
        assert.equal(h().length, 4); // integer is 4 bytes in length
        assert.equal(h()[0], 0x00);
        assert.equal(h()[1], 0x00);
        assert.equal(h()[2], 0x00);
        assert.equal(h()[3], 0x00);
    });

    it('should addShort', function () {
        hexBuffer.addShort(14);
        assert.equal(h().length, 2); // 2 bytes in length
        assert.equal(h()[0], 0x0e);
        assert.equal(h()[1], 0x00);
    });

    it('should addFloat', function () {
        hexBuffer.addFloat(1.234);
        assert.equal(h().length, 4); // 4 bytes in length
        assert.equal(h()[0], 0xb6);
        assert.equal(h()[1], 0xf3);
        assert.equal(h()[2], 0x9d);
        assert.equal(h()[3], 0x3f);
    });

    it('should addByte', function () {
        hexBuffer.addByte(15);
        assert.equal(h()[0], 15);
    });

    it('should addNullTerminator', function () {
        hexBuffer.addNullTerminator();
        assert.equal(h().length, 1);
        assert.equal(h()[0], 0);
    });

    it('should getBuffer', function () {
        hexBuffer.addString('');
        assert(hexBuffer.getBuffer()); // test if this function works
    });

});
