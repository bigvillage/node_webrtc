const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log(ffmpegInstaller.path)


// FFmpeg로 비디오를 HLS 스트리밍으로 변환
ffmpeg('D:/연습용/individual/node/BigBuckBunny.mp4', { timeout: 43200 })
  .addOption([
    '-profile:v baseline',  // 비디오 프로필 설정
    '-level 3.0',           // 비디오 레벨 설정
    '-start_number 0',      // 첫 번째 세그먼트의 번호
    '-hls_time 10',         // 각 세그먼트의 지속 시간 (초)
    '-hls_list_size 0',     // HLS 플레이리스트 크기 (0은 무한대)
    '-f hls',               // 출력 포맷을 HLS로 설정
  ])
  .output('D:/연습용/individual/node/output2.m3u8') // HLS 출력 파일 경로
  .on('end', () => {
    console.log('end');
  })
  .run(); // FFmpeg 변환 작업 실행