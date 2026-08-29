import * as mm from 'music-metadata';

async function run() {
    try {
        const metadata = await mm.parseFile('D:/coding/medical/backend/assets/drugs.sqlite'); // Just any file to test loading
        console.log(metadata.format.duration);
    } catch(e) {
        console.log("Error but loaded: ", e.message);
    }
}
run();
