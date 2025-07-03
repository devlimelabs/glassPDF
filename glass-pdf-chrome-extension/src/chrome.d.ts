declare namespace chrome {
  namespace tabs {
    function print(
      options: {
        tabId?: number;
        printBackground?: boolean;
      },
      callback?: (printJobId: string) => void
    ): void;
  }

  namespace scripting {
    function executeScript(
      injection: {
        target: {
          tabId: number;
          allFrames?: boolean;
          frameIds?: number[];
        };
        files?: string[];
        function?: (...args: any[]) => any;
        args?: any[];
      },
      callback?: (results: ScriptResult[]) => void
    ): void;

    interface ScriptResult {
      frameId: number;
      result: any;
    }
  }
}