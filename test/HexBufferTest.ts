import assert from 'assert';
import { HexBuffer } from '../src/HexBuffer';

let hexBuffer: HexBuffer;

describe('HexBuffer', () => {

    beforeEach(() => {
        // clear the buffer before each test in this block so we
        // don't have to care about what we added in prior tests
        hexBuffer = new HexBuffer();
    });

    it('should addString', () => {
        const testWords = [
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
            'Sawubona Mhlaba' // Zulu
        ];

        let totalLength = 0;
        // tslint:disable-next-line: forin
        for (const word of testWords) {
            const bufLength = Buffer.from(word).length;
            hexBuffer.addString(word);
            totalLength += bufLength + 1; // adding one accounts for the null terminator at the end of the string
            const bufferLength = hexBuffer.getBuffer().length;
            assert.equal(bufferLength, totalLength);
        }
    });

    it('should addNewLine', () => {
        hexBuffer.addNewLine();
        assert.equal(hexBuffer.getBuffer().length, 2);
        assert.equal(hexBuffer.getBuffer()[0], 0x0d);
        assert.equal(hexBuffer.getBuffer()[1], 0x0a);
    });

    it('should addChar', () => {
        hexBuffer.addChar('A');
        assert.equal(hexBuffer.getBuffer().length, 1);
        assert.equal(hexBuffer.getBuffer()[0], 65); // charcode for the ASCII letter "A"
    });

    it('should addChars', () => {
        hexBuffer.addChars('ABCD');
        assert.equal(hexBuffer.getBuffer().length, 4);
        assert.equal(hexBuffer.getBuffer()[0], 65); // charcode for the ASCII letter "A"
        assert.equal(hexBuffer.getBuffer()[1], 66); // charcode for the ASCII letter "B"
        assert.equal(hexBuffer.getBuffer()[2], 67); // charcode for the ASCII letter "C"
        assert.equal(hexBuffer.getBuffer()[3], 68); // charcode for the ASCII letter "D"
    });

    it('should addInt', () => {
        hexBuffer.addInt(0);
        assert.equal(hexBuffer.getBuffer().length, 4); // integer is 4 bytes in length
        assert.equal(hexBuffer.getBuffer()[0], 0x00);
        assert.equal(hexBuffer.getBuffer()[1], 0x00);
        assert.equal(hexBuffer.getBuffer()[2], 0x00);
        assert.equal(hexBuffer.getBuffer()[3], 0x00);
    });

    it('should addShort', () => {
        hexBuffer.addShort(14);
        assert.equal(hexBuffer.getBuffer().length, 2); // 2 bytes in length
        assert.equal(hexBuffer.getBuffer()[0], 0x0e);
        assert.equal(hexBuffer.getBuffer()[1], 0x00);
    });

    it('should addFloat', () => {
        hexBuffer.addFloat(1.234);
        assert.equal(hexBuffer.getBuffer().length, 4); // 4 bytes in length
        assert.equal(hexBuffer.getBuffer()[0], 0xb6);
        assert.equal(hexBuffer.getBuffer()[1], 0xf3);
        assert.equal(hexBuffer.getBuffer()[2], 0x9d);
        assert.equal(hexBuffer.getBuffer()[3], 0x3f);
    });

    it('should addByte', () => {
        hexBuffer.addByte(15);
        assert.equal(hexBuffer.getBuffer()[0], 15);
    });

    it('should addNullTerminator', () => {
        hexBuffer.addNullTerminator();
        assert.equal(hexBuffer.getBuffer().length, 1);
        assert.equal(hexBuffer.getBuffer()[0], 0);
    });

    it('should getBuffer', () => {
        hexBuffer.addString('');
        assert(hexBuffer.getBuffer()); // test if this function works
    });

});
