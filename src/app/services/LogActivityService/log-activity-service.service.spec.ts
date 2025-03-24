import { TestBed } from '@angular/core/testing';

import { LogActivityServiceService } from './log-activity-service.service';

describe('LogActivityServiceService', () => {
  let service: LogActivityServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogActivityServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
