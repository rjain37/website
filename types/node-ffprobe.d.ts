declare module 'node-ffprobe' {
  export interface FFProbeStream {
    width?: number;
    height?: number;
    codec_type?: string;
    codec_name?: string;
    duration?: string;
    bit_rate?: string;
    [key: string]: any;
  }

  export interface FFProbeResult {
    streams: FFProbeStream[];
    format: {
      filename: string;
      nb_streams: number;
      format_name: string;
      duration: string;
      bit_rate: string;
      [key: string]: any;
    };
  }

  export function ffprobe(filePath: string, ffprobePath: string): Promise<FFProbeResult>;
}
